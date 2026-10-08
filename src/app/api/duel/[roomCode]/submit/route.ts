import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/rooms";
import { getProblemForJudging } from "@/lib/problems";
import { getServerProblem } from "@/data/problems";
import { executeCodeOnlineCompilerSyncWithLang, normalizeOutput } from "@/lib/onlinecompiler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const body = await request.json();
    const { playerName, code, language = "python" } = body;

    if (!roomCode) {
      return NextResponse.json(
        { error: "roomCode is required" },
        { status: 400 }
      );
    }

    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { error: "playerName is required" },
        { status: 400 }
      );
    }

    if (code === undefined || typeof code !== "string") {
      return NextResponse.json(
        { error: "code is required" },
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

    // Check timer expiration
    if (room.endsAt && Date.now() >= room.endsAt) {
      room.status = "FINISHED";
      await setRoom(room);
      return NextResponse.json(
        { error: "Duel time has expired" },
        { status: 400 }
      );
    }

    if (room.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Duel is not active (status: ${room.status})` },
        { status: 400 }
      );
    }

    // Load problem test cases
    const fullProblem = await getProblemForJudging(room.problemId);
    const serverProb = getServerProblem(room.problemId);

    const testSuite =
      fullProblem?.hiddenTestCases && fullProblem.hiddenTestCases.length > 0
        ? fullProblem.hiddenTestCases.map((t) => ({ input: t.input, expected: t.expectedOutput }))
        : serverProb?.hiddenTests ||
          fullProblem?.examples?.map((e) => ({ input: e.input, expected: e.output })) ||
          [];

    if (testSuite.length === 0) {
      return NextResponse.json(
        { error: `No test suite available for problem '${room.problemId}'` },
        { status: 500 }
      );
    }

    const trimmedName = playerName.trim().toLowerCase();
    const isP1 = room.player1?.name?.toLowerCase() === trimmedName;
    const isP2 = room.player2?.name?.toLowerCase() === trimmedName;

    if (!isP1 && !isP2) {
      return NextResponse.json(
        { error: `Player '${playerName}' is not in this room` },
        { status: 403 }
      );
    }

    const targetPlayer = isP1 ? room.player1 : room.player2!;

    let testsPassed = 0;
    const totalTests = testSuite.length;

    for (const test of testSuite) {
      const execResult = await executeCodeOnlineCompilerSyncWithLang(
        language,
        code,
        test.input
      );

      if (execResult.success && !execResult.compilationError && !execResult.runtimeError && !execResult.isTimeout) {
        const normalizedActual = normalizeOutput(execResult.stdout);
        const normalizedExpected = normalizeOutput(test.expected);

        if (normalizedActual === normalizedExpected) {
          testsPassed++;
        }
      }
    }

    const isAllPassed = totalTests > 0 && testsPassed === totalTests;

    // Update target player's state
    targetPlayer.code = code;
    targetPlayer.testsPassed = testsPassed;
    targetPlayer.totalTests = totalTests;
    targetPlayer.submittedAt = Date.now();
    targetPlayer.status = isAllPassed ? "SOLVED" : "SUBMITTED";

    // If both players have completed (solved or submitted) or if someone solved all
    const p1Done = room.player1?.status === "SOLVED" || room.player1?.status === "SUBMITTED";
    const p2Done = room.player2 && (room.player2.status === "SOLVED" || room.player2.status === "SUBMITTED");

    if (p1Done && p2Done) {
      room.status = "FINISHED";
    }

    await setRoom(room);

    return NextResponse.json({
      testsPassed,
      totalTests,
      success: isAllPassed,
    });
  } catch (err: unknown) {
    console.error("Error submitting code in duel:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
