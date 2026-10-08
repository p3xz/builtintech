import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Question } from "@/models/Question";
import { Submission } from "@/models/Submission";
import { DuelRoom } from "@/models/DuelRoom";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult || !authResult.user || authResult.role !== "admin") {
      if (!authResult || !authResult.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (authResult.role !== "admin") {
        return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
      }
    }

    await connectToDatabase();

    const [totalUsers, totalProblems, totalSubmissions, totalDuels, recentUsers, recentDuels] =
      await Promise.all([
        User.countDocuments(),
        Question.countDocuments(),
        Submission.countDocuments(),
        DuelRoom.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select("username email role xp duelRating createdAt").lean(),
        DuelRoom.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    const acceptedSubmissions = await Submission.countDocuments({ status: "Accepted" });
    const successRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalDuels,
        acceptedSubmissions,
        successRate,
      },
      recentUsers,
      recentDuels,
      systemStatus: {
        database: "Healthy (MongoDB Atlas / ReplicaSet)",
        compilerSandbox: "OnlineCompiler API (Sync 35s max)",
        aiReferee: "Groq LLaMA 3.3 70B Versatile",
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Admin Overview] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
