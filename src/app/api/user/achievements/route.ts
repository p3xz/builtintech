import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { UserLearning } from "@/models/UserLearning";
import { UserCertificate } from "@/models/UserCertificate";
import { IAchievement } from "@/types/learning";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const dbUser = await User.findById(session.user.id);
    const learning = await UserLearning.findOne({ userId: session.user.id });
    const certificatesCount = await UserCertificate.countDocuments({ userId: session.user.id });

    const totalSubmissions = dbUser?.totalSubmissions || 0;
    const completedLessons = learning?.completedLessonIds?.length || 0;
    const passedQuizzes = learning?.passedQuizIds?.length || 0;
    const currentStreak = dbUser?.currentStreak || 0;
    const longestStreak = dbUser?.longestStreak || 0;
    const duelsWon = dbUser?.duelsWon || 0;
    const solvedCases = learning?.solvedCases?.length || 0;

    const achievements: IAchievement[] = [
      {
        id: "first-program",
        code: "FIRST_PROGRAM",
        title: "First Program",
        description: "Write and execute your first line of code in the sandbox.",
        icon: "🚀",
        category: "learning",
        xpReward: 50,
        unlocked: totalSubmissions > 0 || completedLessons > 0,
        progressPercent: totalSubmissions > 0 || completedLessons > 0 ? 100 : 0,
      },
      {
        id: "first-quiz",
        code: "FIRST_QUIZ",
        title: "First Quiz Passed",
        description: "Complete and pass your first module checkpoint quiz.",
        icon: "🎯",
        category: "quiz",
        xpReward: 100,
        unlocked: passedQuizzes > 0,
        progressPercent: passedQuizzes > 0 ? 100 : 0,
      },
      {
        id: "streak-7",
        code: "STREAK_7",
        title: "7-Day Streak",
        description: "Code and complete learning activities 7 days in a row.",
        icon: "🔥",
        category: "streak",
        xpReward: 150,
        unlocked: currentStreak >= 7 || longestStreak >= 7,
        progressPercent: Math.min(100, Math.round((Math.max(currentStreak, longestStreak) / 7) * 100)),
      },
      {
        id: "first-course",
        code: "FIRST_COURSE",
        title: "Course Graduate",
        description: "Finish all modules and earn your first course certificate.",
        icon: "🎓",
        category: "learning",
        xpReward: 250,
        unlocked: certificatesCount > 0,
        progressPercent: certificatesCount > 0 ? 100 : Math.min(100, (learning?.completedModuleIds?.length || 0) * 33),
      },
      {
        id: "first-mission",
        code: "FIRST_MISSION",
        title: "Mission Accomplished",
        description: "Complete a daily learning mission.",
        icon: "⚡",
        category: "special",
        xpReward: 50,
        unlocked: Boolean(learning?.dailyMissionCompleted),
        progressPercent: learning?.dailyMissionCompleted ? 100 : 0,
      },
      {
        id: "code-detective",
        code: "CODE_DETECTIVE",
        title: "Lead Detective",
        description: "Investigate server logs, inspect clues, and solve a Detective Case.",
        icon: "🕵️",
        category: "special",
        xpReward: 150,
        unlocked: solvedCases > 0,
        progressPercent: solvedCases > 0 ? 100 : 0,
      },
      {
        id: "first-duel-win",
        code: "FIRST_DUEL_WIN",
        title: "Arena Champion",
        description: "Win your first 1v1 live coding duel refereed by AI.",
        icon: "⚔️",
        category: "duel",
        xpReward: 100,
        unlocked: duelsWon > 0,
        progressPercent: duelsWon > 0 ? 100 : 0,
      },
    ];

    return NextResponse.json({ success: true, achievements });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}
