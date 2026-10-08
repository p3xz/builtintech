import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Question } from "@/models/Question";
import { Submission } from "@/models/Submission";
import { DuelRoom } from "@/models/DuelRoom";

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalUsers,
      totalProblems,
      totalSubmissions,
      acceptedSubmissions,
      totalDuelsFought,
      topDuels,
      difficultyCounts,
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments({ isPublished: true }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: "Accepted" }),
      DuelRoom.countDocuments({ status: "FINISHED" }),
      DuelRoom.find({ status: "FINISHED" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("roomCode problemId problemTitle winner player1 player2 createdAt")
        .lean(),
      Question.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      ]),
    ]);

    const globalAcceptanceRate =
      totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : 0;

    const difficulties: Record<string, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };
    difficultyCounts.forEach((d) => {
      if (d._id in difficulties) {
        difficulties[d._id] = d.count;
      }
    });

    return NextResponse.json({
      totalUsers,
      totalProblems,
      totalSubmissions,
      acceptedSubmissions,
      globalAcceptanceRate,
      totalDuelsFought,
      difficulties,
      recentFinishedDuels: topDuels,
    });
  } catch (err: unknown) {
    console.error("[API GET /api/stats] Error:", err);
    return NextResponse.json(
      { error: "Internal server error fetching stats" },
      { status: 500 }
    );
  }
}
