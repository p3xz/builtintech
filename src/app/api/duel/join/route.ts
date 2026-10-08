import { NextRequest, NextResponse } from "next/server";
import { getRoom, atomicJoinRoom, toClientRoom } from "@/lib/rooms";
import { getServerProblem } from "@/data/problems";
import { getProblemForJudging } from "@/lib/problems";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STARTER_PYTHON = `# Write your solution below using stdin and stdout
import sys

def solve():
    input_data = sys.stdin.read().strip()
    # TODO: Implement solution
    pass

if __name__ == "__main__":
    solve()
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomCode, playerName } = body;

    const session = await auth();
    const resolvedName = (playerName || session?.user?.displayName || session?.user?.username || "").trim();

    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json(
        { error: "roomCode is required" },
        { status: 400 }
      );
    }

    if (!resolvedName) {
      return NextResponse.json(
        { error: "playerName is required" },
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

    // If player1 re-joins or reconnects
    if (room.player1.name.toLowerCase() === resolvedName.toLowerCase()) {
      return NextResponse.json(toClientRoom(room, resolvedName));
    }

    // If player2 re-joins or reconnects
    if (
      room.player2 &&
      room.player2.name.toLowerCase() === resolvedName.toLowerCase()
    ) {
      return NextResponse.json(toClientRoom(room, resolvedName));
    }

    // If room already has a different player2 or is not waiting
    if (room.player2 && room.player2.name.toLowerCase() !== resolvedName.toLowerCase()) {
      return NextResponse.json(
        { error: "Room is already full" },
        { status: 409 }
      );
    }

    if (room.status !== "WAITING") {
      return NextResponse.json(
        { error: `Room is no longer waiting for players (status: ${room.status})` },
        { status: 409 }
      );
    }

    // Determine problem test count
    const fullProblem = await getProblemForJudging(room.problemId);
    const serverProb = getServerProblem(room.problemId);
    const totalTests = fullProblem?.hiddenTestCases?.length || serverProb?.hiddenTests?.length || 8;

    // Perform atomic join & state transition WAITING -> ACTIVE
    const updatedRoom = await atomicJoinRoom(
      roomCode,
      resolvedName,
      STARTER_PYTHON,
      totalTests
    );

    if (!updatedRoom) {
      // Refresh state to give precise error
      const freshRoom = await getRoom(roomCode);
      if (freshRoom?.player2 && freshRoom.player2.name.toLowerCase() === resolvedName.toLowerCase()) {
        return NextResponse.json(toClientRoom(freshRoom, resolvedName));
      }
      return NextResponse.json(
        { error: "Failed to join room (room may already be active or full)" },
        { status: 409 }
      );
    }

    return NextResponse.json(toClientRoom(updatedRoom, resolvedName));
  } catch (err: unknown) {
    console.error("Error joining duel:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
