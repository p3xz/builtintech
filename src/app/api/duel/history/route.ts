import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { DuelRoom } from "@/models/DuelRoom";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const username = session.user.username;
    const duels = await DuelRoom.find({
      status: "FINISHED",
      $or: [
        { "player1.username": username },
        { "player2.username": username },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const history = duels.map((d) => {
      const isP1 = d.player1.username === username;
      const opponent = isP1 ? d.player2 : d.player1;
      const userPlayer = isP1 ? d.player1 : d.player2;

      let result: "WIN" | "LOSS" | "DRAW" = "DRAW";
      if (d.winner === username) {
        result = "WIN";
      } else if (d.winner && d.winner !== username) {
        result = "LOSS";
      }

      return {
        id: d._id.toString(),
        roomCode: d.roomCode,
        problemId: d.problemId,
        problemTitle: d.problemTitle || "Coding Duel",
        result,
        winner: d.winner,
        userScore: {
          testsPassed: userPlayer?.testsPassed || 0,
          totalTests: userPlayer?.totalTests || 0,
        },
        opponent: opponent
          ? {
              username: opponent.username,
              displayName: opponent.displayName,
              testsPassed: opponent.testsPassed || 0,
              totalTests: opponent.totalTests || 0,
            }
          : null,
        verdict: d.judgeResult?.verdict || "Completed duel",
        completedAt: d.updatedAt,
      };
    });

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("[Duel History API Error]:", error);
    return NextResponse.json({ error: "Failed to fetch duel history" }, { status: 500 });
  }
}
