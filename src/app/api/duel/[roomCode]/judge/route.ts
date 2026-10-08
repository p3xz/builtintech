import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/rooms";
import { getServerProblem } from "@/data/problems";
import { executeCodeOnlineCompilerSync } from "@/lib/onlinecompiler";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  scoreReadabilityWithGroq,
  getPlayerFeedbackWithGroq,
  generateVerdictWithGroq,
  determineWinner,
} from "@/lib/judge";
import { JudgeResult, PlayerJudgeScore } from "@/types/room";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;

    if (!roomCode) {
      return NextResponse.json(
        { error: "roomCode is required" },
        { status: 400 }
      );
    }

    const room = await getRoom(roomCode);
    if (!room) {
      return NextResponse.json(
        { error: `Room '${roomCode.toUpperCase()}' not found` },
        { status: 404 }
      );
    }

    // Return cached judge result if already judged
    if (room.judgeResult) {
      return NextResponse.json({
        success: true,
        judgeResult: room.judgeResult,
      });
    }

    // Guard: reject unless duel is genuinely over
    const p1Done = room.player1.status === "SOLVED" || room.player1.status === "SUBMITTED";
    const p2Done = room.player2 && (room.player2.status === "SOLVED" || room.player2.status === "SUBMITTED");
    const timerExpired = Boolean(room.endsAt && Date.now() >= room.endsAt);

    const isDuelOver = (p1Done && p2Done) || timerExpired;
    if (!isDuelOver) {
      return NextResponse.json(
        { error: "Duel is still active and not ready for judging" },
        { status: 400 }
      );
    }

    const problem = getServerProblem(room.problemId);
    if (!problem) {
      return NextResponse.json(
        { error: "Problem data not found" },
        { status: 404 }
      );
    }

    const p1 = room.player1;
    const p2 = room.player2 || {
      name: "Player 2",
      code: "",
      status: "CODING",
      testsPassed: 0,
      totalTests: problem.hiddenTests.length,
    };

    // Step 2: Efficiency — run each player's code against heaviest test (last test)
    const heaviestTest = problem.hiddenTests[problem.hiddenTests.length - 1];
    const [p1EffResult, p2EffResult] = await Promise.all([
      p1.code ? executeCodeOnlineCompilerSync(p1.code, heaviestTest.input) : Promise.resolve({ time: 2, success: false, stdout: "", stderr: "", output: "", memory: 0, isTimeout: false, compilationError: false, runtimeError: false }),
      p2.code ? executeCodeOnlineCompilerSync(p2.code, heaviestTest.input) : Promise.resolve({ time: 2, success: false, stdout: "", stderr: "", output: "", memory: 0, isTimeout: false, compilationError: false, runtimeError: false }),
    ]);

    const p1RuntimeMs = Math.min(2000, Math.round(p1EffResult.time * 1000) || 120);
    const p2RuntimeMs = Math.min(2000, Math.round(p2EffResult.time * 1000) || 120);

    // Step 3: Commit-first reference calibration
    const referenceSolution = problem.referenceSolution;

    // Step 4: Readability — two Groq calls in parallel
    const [p1Readability, p2Readability] = await Promise.all([
      scoreReadabilityWithGroq(p1.code || "", problem.title),
      scoreReadabilityWithGroq(p2.code || "", problem.title),
    ]);

    // Prepare plain-language failure descriptions for feedback (no raw test arrays)
    const p1FailedCount = p1.totalTests - p1.testsPassed;
    const p2FailedCount = p2.totalTests - p2.testsPassed;

    const p1FailSummary =
      p1FailedCount === 0
        ? "All hidden test cases passed successfully."
        : `Failed on ${p1FailedCount} hidden test cases (e.g. boundary conditions or large inputs).`;

    const p2FailSummary =
      p2FailedCount === 0
        ? "All hidden test cases passed successfully."
        : `Failed on ${p2FailedCount} hidden test cases (e.g. boundary conditions or large inputs).`;

    // Step 5: Per-player feedback — two Groq calls in parallel
    const [p1Feedback, p2Feedback] = await Promise.all([
      getPlayerFeedbackWithGroq(p1.code || "", problem.title, p1FailSummary, referenceSolution),
      getPlayerFeedbackWithGroq(p2.code || "", problem.title, p2FailSummary, referenceSolution),
    ]);

    const p1Score: PlayerJudgeScore = {
      name: p1.name,
      testsPassed: p1.testsPassed,
      totalTests: p1.totalTests,
      runtimeMs: p1RuntimeMs,
      readability: p1Readability,
      feedback: p1Feedback,
    };

    const p2Score: PlayerJudgeScore = {
      name: p2.name,
      testsPassed: p2.testsPassed,
      totalTests: p2.totalTests,
      runtimeMs: p2RuntimeMs,
      readability: p2Readability,
      feedback: p2Feedback,
    };

    // Step 7: Deterministic Winner Decision
    const winner = determineWinner(p1Score, p2Score);

    // Step 6: Ringside Verdict via Groq
    const verdict = await generateVerdictWithGroq(p1Score, p2Score, winner, problem.title);

    const judgeResult: JudgeResult = {
      winner,
      verdict,
      player1: p1Score,
      player2: p2Score,
      judgedAt: Date.now(),
    };

    // Save on room
    room.status = "FINISHED";
    room.judgeResult = judgeResult;
    await setRoom(room);

    // Step 8: Update User Duel Statistics and Ratings in MongoDB
    try {
      await connectToDatabase();
      const p1User = await User.findOne({ usernameNormalized: p1.name.toLowerCase().trim() });
      const p2User = room.player2 ? await User.findOne({ usernameNormalized: p2.name.toLowerCase().trim() }) : null;

      if (p1User) {
        p1User.duelsPlayed = (p1User.duelsPlayed || 0) + 1;
        if (winner === p1.name) {
          p1User.duelsWon = (p1User.duelsWon || 0) + 1;
          p1User.duelRating = (p1User.duelRating || 1000) + 25;
          p1User.xp = (p1User.xp || 0) + 20; // Bonus XP for duel victory
        } else if (winner === null) {
          p1User.duelRating = (p1User.duelRating || 1000) + 5;
        } else {
          p1User.duelsLost = (p1User.duelsLost || 0) + 1;
          p1User.duelRating = Math.max(100, (p1User.duelRating || 1000) - 15);
        }
        await p1User.save();
      }

      if (p2User) {
        p2User.duelsPlayed = (p2User.duelsPlayed || 0) + 1;
        if (winner === p2.name) {
          p2User.duelsWon = (p2User.duelsWon || 0) + 1;
          p2User.duelRating = (p2User.duelRating || 1000) + 25;
          p2User.xp = (p2User.xp || 0) + 20;
        } else if (winner === null) {
          p2User.duelRating = (p2User.duelRating || 1000) + 5;
        } else {
          p2User.duelsLost = (p2User.duelsLost || 0) + 1;
          p2User.duelRating = Math.max(100, (p2User.duelRating || 1000) - 15);
        }
        await p2User.save();
      }
    } catch (dbErr) {
      console.error("[Judge] User stats rating update error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      judgeResult,
    });
  } catch (err: unknown) {
    console.error("Judging error:", err);
    return NextResponse.json(
      { error: "Internal server error during judging" },
      { status: 500 }
    );
  }
}
