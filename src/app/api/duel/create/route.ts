import { NextRequest, NextResponse } from "next/server";
import { generateRoomCode, setRoom } from "@/lib/rooms";
import { getServerProblem } from "@/data/problems";
import { Room } from "@/types/room";
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
    const { playerName, problemId } = body;

    const session = await auth();
    const resolvedName = (playerName || session?.user?.displayName || session?.user?.username || "").trim();

    if (!resolvedName) {
      return NextResponse.json(
        { error: "playerName is required" },
        { status: 400 }
      );
    }

    if (!problemId || typeof problemId !== "string") {
      return NextResponse.json(
        { error: "problemId is required" },
        { status: 400 }
      );
    }

    const problem = getServerProblem(problemId);
    const totalTests = problem ? problem.hiddenTests.length : 8;

    const roomCode = generateRoomCode();
    const room: Room = {
      roomCode,
      problemId,
      status: "WAITING",
      player1: {
        name: resolvedName,
        code: STARTER_PYTHON,
        status: "CODING",
        testsPassed: 0,
        totalTests,
      },
    };

    await setRoom(room);

    return NextResponse.json({ roomCode }, { status: 201 });
  } catch (err: unknown) {
    console.error("Error creating duel:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
