import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom } from "@/lib/rooms";
import { getServerProblem } from "@/data/problems";
import { executeCodeOnlineCompilerSync } from "@/lib/onlinecompiler";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const body = await request.json();
    const { playerName, code } = body;

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

    const problem = getServerProblem(room.problemId);
    if (!problem) {
      return NextResponse.json(
        { error: `Problem '${room.problemId}' not found` },
        { status: 404 }
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
    const totalTests = problem.hiddenTests.length;

    for (const test of problem.hiddenTests) {
      const execResult = await executeCodeOnlineCompilerSync(code, test.input);

      if (execResult.success) {
        const normalizedActual = String(execResult.stdout ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n").map((l) => l.trimEnd()).join("\n");
        const normalizedExpected = String(test.expected ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n").map((l) => l.trimEnd()).join("\n");

        if (normalizedActual === normalizedExpected) {
          testsPassed++;
        }
      }
    }

    const isAllPassed = totalTests > 0 && testsPassed === totalTests;

    // Update player state
    targetPlayer.code = code;
    targetPlayer.testsPassed = testsPassed;
    targetPlayer.totalTests = totalTests;
    targetPlayer.submittedAt = Date.now();
    targetPlayer.status = isAllPassed ? "SOLVED" : "SUBMITTED";

    // If both players solved, finish the room
    if (room.player1?.status === "SOLVED" && room.player2?.status === "SOLVED") {
      room.status = "FINISHED";
    }

    await setRoom(room);

    return NextResponse.json({
      testsPassed,
      totalTests,
      success: isAllPassed,
    });
  } catch (err: unknown) {
    console.error("Error submitting code:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
