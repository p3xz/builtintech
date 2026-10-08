import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Submission } from "@/models/Submission";
import { Question } from "@/models/Question";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({
      usernameNormalized: username.toLowerCase().trim(),
    }).lean();

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Fetch recent submissions
    const recentSubmissions = await Submission.find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("problemId problemTitle language status runtime testsPassed totalTests awardedXp createdAt")
      .lean();

    // Fetch details of solved problems
    const solvedQuestions = await Question.find({
      problemId: { $in: user.solvedProblems || [] },
    })
      .select("problemId title difficulty xp tags")
      .lean();

    const winRate =
      user.duelsPlayed > 0
        ? Math.round((user.duelsWon / user.duelsPlayed) * 100)
        : 0;

    const acceptanceRate =
      user.totalSubmissions > 0
        ? Math.round((user.acceptedSubmissions / user.totalSubmissions) * 100)
        : 0;

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        image: user.image,
        xp: user.xp || 0,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        solvedCount: user.solvedProblems?.length || 0,
        totalSubmissions: user.totalSubmissions || 0,
        acceptedSubmissions: user.acceptedSubmissions || 0,
        acceptanceRate,
        duelRating: user.duelRating || 1000,
        duelsPlayed: user.duelsPlayed || 0,
        duelsWon: user.duelsWon || 0,
        duelsLost: user.duelsLost || 0,
        winRate,
        createdAt: user.createdAt,
      },
      solvedQuestions,
      recentSubmissions,
    });
  } catch (err: unknown) {
    console.error("[API GET /api/profile/[username]] Error:", err);
    return NextResponse.json(
      { error: "Internal server error fetching profile" },
      { status: 500 }
    );
  }
}
