import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getTierFromRating } from "@/lib/tier";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find()
      .sort({ duelRating: -1, duelsWon: -1, xp: -1 })
      .limit(50)
      .select("username displayName image xp currentStreak duelRating duelsPlayed duelsWon duelsLost solvedProblems")
      .lean();

    const leaderboard = users.map((u, index) => {
      const winRate =
        u.duelsPlayed > 0
          ? Math.round((u.duelsWon / u.duelsPlayed) * 100)
          : 0;
      const tierInfo = getTierFromRating(u.duelRating || 1000);

      return {
        rank: index + 1,
        id: u._id.toString(),
        username: u.username,
        displayName: u.displayName,
        image: u.image,
        xp: u.xp || 0,
        currentStreak: u.currentStreak || 0,
        duelRating: u.duelRating || 1000,
        tier: tierInfo.tier,
        tierBadge: tierInfo.badge,
        tierColor: tierInfo.color,
        duelsPlayed: u.duelsPlayed || 0,
        duelsWon: u.duelsWon || 0,
        duelsLost: u.duelsLost || 0,
        winRate,
        solvedCount: u.solvedProblems?.length || 0,
      };
    });

    return NextResponse.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (err: unknown) {
    console.error("[API GET /api/duel/leaderboard] Error:", err);
    return NextResponse.json(
      { error: "Internal server error fetching leaderboard" },
      { status: 500 }
    );
  }
}
