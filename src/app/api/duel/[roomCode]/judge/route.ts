import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/rooms";
import { getProblemForJudging } from "@/lib/problems";
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // Guard: check if duel has finished or timer expired or either solved
    const p1Done = room.player1?.status === "SOLVED" || room.player1?.status === "SUBMITTED";
    const p2Done = room.player2 && (room.player2.status === "SOLVED" || room.player2.status === "SUBMITTED");
    const timerExpired = Boolean(room.endsAt && Date.now() >= room.endsAt);
    const eitherSolved = room.player1?.status === "SOLVED" || room.player2?.status === "SOLVED";

    const isDuelOver = (p1Done && p2Done) || timerExpired || eitherSolved || room.status === "FINISHED";
    if (!isDuelOver && room.status !== "FINISHED") {
      return NextResponse.json(
        { error: "Duel is still active and not ready for judging" },
        { status: 400 }
      );
    }

    const fullProblem = await getProblemForJudging(room.problemId);
    const serverProb = getServerProblem(room.problemId);

    const problemTitle = fullProblem?.title || serverProb?.title || "Coding Duel";
    const referenceSolution = fullProblem?.referenceSolution || serverProb?.referenceSolution || "pass";

    const testSuite =
      fullProblem?.hiddenTestCases && fullProblem.hiddenTestCases.length > 0
        ? fullProblem.hiddenTestCases.map((t) => ({ input: t.input, expected: t.expectedOutput }))
        : serverProb?.hiddenTests ||
          fullProblem?.examples?.map((e) => ({ input: e.input, expected: e.output })) ||
          [{ input: "", expected: "" }];

    const p1 = room.player1;
    const p2 = room.player2 || {
      name: "Player 2",
      code: "",
      status: "CODING",
      testsPassed: 0,
      totalTests: testSuite.length,
    };

    // Step 2: Efficiency run against heaviest test case
    const heaviestTest = testSuite[testSuite.length - 1];
    const [p1EffResult, p2EffResult] = await Promise.all([
      p1?.code
        ? executeCodeOnlineCompilerSync(p1.code, heaviestTest.input)
        : Promise.resolve({ time: 0.1, success: false, stdout: "", stderr: "", output: "", memory: 0, isTimeout: false, compilationError: false, runtimeError: false }),
      p2?.code
        ? executeCodeOnlineCompilerSync(p2.code, heaviestTest.input)
        : Promise.resolve({ time: 0.1, success: false, stdout: "", stderr: "", output: "", memory: 0, isTimeout: false, compilationError: false, runtimeError: false }),
    ]);

    const p1RuntimeMs = Math.min(2000, Math.round(p1EffResult.time * 1000) || 120);
    const p2RuntimeMs = Math.min(2000, Math.round(p2EffResult.time * 1000) || 120);

    // Step 3: Readability Scoring
    const [p1Readability, p2Readability] = await Promise.all([
      scoreReadabilityWithGroq(p1.code || "", problemTitle),
      scoreReadabilityWithGroq(p2.code || "", problemTitle),
    ]);

    const p1FailedCount = Math.max(0, (p1.totalTests || testSuite.length) - p1.testsPassed);
    const p2FailedCount = Math.max(0, (p2.totalTests || testSuite.length) - p2.testsPassed);

    const p1FailSummary =
      p1FailedCount === 0
        ? "All hidden test cases passed successfully."
        : `Failed on ${p1FailedCount} hidden test cases.`;

    const p2FailSummary =
      p2FailedCount === 0
        ? "All hidden test cases passed successfully."
        : `Failed on ${p2FailedCount} hidden test cases.`;

    // Step 4: Per-player coaching feedback
    const [p1Feedback, p2Feedback] = await Promise.all([
      getPlayerFeedbackWithGroq(p1.code || "", problemTitle, p1FailSummary, referenceSolution),
      getPlayerFeedbackWithGroq(p2.code || "", problemTitle, p2FailSummary, referenceSolution),
    ]);

    const p1Score: PlayerJudgeScore = {
      name: p1.name,
      testsPassed: p1.testsPassed,
      totalTests: p1.totalTests || testSuite.length,
      runtimeMs: p1RuntimeMs,
      readability: p1Readability,
      feedback: p1Feedback,
    };

    const p2Score: PlayerJudgeScore = {
      name: p2.name,
      testsPassed: p2.testsPassed,
      totalTests: p2.totalTests || testSuite.length,
      runtimeMs: p2RuntimeMs,
      readability: p2Readability,
      feedback: p2Feedback,
    };

    // Step 5: Deterministic Winner Decision
    const winner = determineWinner(p1Score, p2Score);

    // Step 6: Ringside Verdict
    const verdict = await generateVerdictWithGroq(p1Score, p2Score, winner, problemTitle);

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

    // Step 7: Update User Duel Statistics and Ratings in MongoDB
    try {
      await connectToDatabase();
      const p1User = await User.findOne({
        $or: [
          { usernameNormalized: p1.name.toLowerCase().trim() },
          { username: p1.name.trim() },
          { displayName: p1.name.trim() },
        ],
      });

      const p2User = room.player2
        ? await User.findOne({
            $or: [
              { usernameNormalized: p2.name.toLowerCase().trim() },
              { username: p2.name.trim() },
              { displayName: p2.name.trim() },
            ],
          })
        : null;

      if (p1User) {
        p1User.duelsPlayed = (p1User.duelsPlayed || 0) + 1;
        if (winner === p1.name) {
          p1User.duelsWon = (p1User.duelsWon || 0) + 1;
          p1User.duelRating = (p1User.duelRating || 1000) + 25;
          p1User.xp = (p1User.xp || 0) + 20;
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
