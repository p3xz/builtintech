import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Submission } from "@/models/Submission";
import { Question } from "@/models/Question";
import { DuelRoom } from "@/models/DuelRoom";

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

    const clean = decodeURIComponent(username).trim();
    const normalized = clean.toLowerCase();

    let user = null;

    // 1. If "me", "current", or fallback "learner", resolve from session first
    if (normalized === "me" || normalized === "current" || normalized === "learner") {
      const session = await auth();
      if (session?.user?.id || session?.user?.email) {
        user = await User.findOne({
          $or: [
            ...(session.user.id && /^[0-9a-fA-F]{24}$/.test(session.user.id) ? [{ _id: session.user.id }] : []),
            ...(session.user.email ? [{ email: session.user.email.toLowerCase().trim() }] : []),
            ...(session.user.username ? [{ usernameNormalized: session.user.username.toLowerCase().trim() }] : []),
          ],
        }).lean();
      }
    }

    // 2. Query by usernameNormalized, username, email, or _id
    if (!user) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(clean);
      user = await User.findOne({
        $or: [
          { usernameNormalized: normalized },
          { username: clean },
          { email: normalized },
          ...(isObjectId ? [{ _id: clean }] : []),
        ],
      }).lean();
    }

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const userIdStr = user._id.toString();

    // Fetch recent submissions
    const recentSubmissions = await Submission.find({
      $or: [
        { userId: userIdStr },
        { userEmail: user.email },
        { username: user.username },
      ],
    })
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

    // Fetch recent duels
    const recentDuels = await DuelRoom.find({
      "players.userId": userIdStr,
      status: "FINISHED",
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("roomCode problemTitle players winnerId createdAt")
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
        id: userIdStr,
        username: user.username,
        displayName: user.displayName || user.username,
        email: user.email,
        image: user.image,
        role: user.role || "user",
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
      solvedQuestions: solvedQuestions || [],
      recentSubmissions: recentSubmissions || [],
      recentDuels: recentDuels || [],
    });
  } catch (err: unknown) {
    console.error("[API GET /api/profile/[username]] Error:", err);
    return NextResponse.json(
      { error: "Internal server error fetching profile" },
      { status: 500 }
    );
  }
}
