import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom, toClientRoom } from "@/lib/rooms";
import { getServerProblem } from "@/data/problems";
import { auth } from "@/lib/auth";

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

    // If room already has 2 players
    if (room.player2 && room.status !== "WAITING") {
      return NextResponse.json(
        { error: "Room is already full" },
        { status: 409 }
      );
    }

    const problem = getServerProblem(room.problemId);
    const totalTests = problem ? problem.hiddenTests.length : 8;

    // Add player2 and start duel
    room.player2 = {
      name: resolvedName,
      code: STARTER_PYTHON,
      status: "CODING",
      testsPassed: 0,
      totalTests,
    };
    room.status = "ACTIVE";
    room.endsAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await setRoom(room);

    return NextResponse.json(toClientRoom(room, resolvedName));
  } catch (err: unknown) {
    console.error("Error joining duel:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
