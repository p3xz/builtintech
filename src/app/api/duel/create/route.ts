import { NextRequest, NextResponse } from "next/server";
import { generateRoomCode, setRoom } from "@/lib/rooms";
import { getServerProblem } from "@/data/problems";
import { getAllPublishedProblems, getProblemForJudging } from "@/lib/problems";
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
    let { playerName, problemId, difficulty } = body;

    const session = await auth();
    const resolvedName = (playerName || session?.user?.displayName || session?.user?.username || "").trim();

    if (!resolvedName) {
      return NextResponse.json(
        { error: "playerName is required" },
        { status: 400 }
      );
    }

    // Normalize difficulty: "Easy" | "Medium" | "Hard"
    let normalizedDifficulty: "Easy" | "Medium" | "Hard" = "Easy";
    if (typeof difficulty === "string") {
      const lower = difficulty.toLowerCase().trim();
      if (lower === "hard") normalizedDifficulty = "Hard";
      else if (lower === "medium") normalizedDifficulty = "Medium";
      else normalizedDifficulty = "Easy";
    }

    // If problemId is not provided or set to "random", auto-select from published problems matching difficulty
    let resolvedProblemId = (problemId || "").trim();
    if (!resolvedProblemId || resolvedProblemId === "random") {
      const matchingProblems = await getAllPublishedProblems({ difficulty: normalizedDifficulty });
      if (matchingProblems.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingProblems.length);
        resolvedProblemId = matchingProblems[randomIndex].problemId || matchingProblems[randomIndex].slug;
      } else {
        // Fallback to two-sum or longest-substring
        resolvedProblemId = normalizedDifficulty === "Hard" ? "reverse-integer" : normalizedDifficulty === "Medium" ? "longest-substring-without-repeating-characters" : "two-sum";
      }
    }

    // Get total test count for problem
    const fullProblem = await getProblemForJudging(resolvedProblemId);
    const serverProb = getServerProblem(resolvedProblemId);
    const totalTests = fullProblem?.hiddenTestCases?.length || serverProb?.hiddenTests?.length || 8;

    const roomCode = generateRoomCode();
    const room: Room = {
      roomCode,
      problemId: resolvedProblemId,
      difficulty: normalizedDifficulty,
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

    return NextResponse.json({ roomCode, problemId: resolvedProblemId, difficulty: normalizedDifficulty }, { status: 201 });

  } catch (err: unknown) {
    console.error("Error creating duel:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
