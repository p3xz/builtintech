import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { evaluateAndRecordSubmission } from "@/lib/submission";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId, language = "python", code } = body;

    if (!problemId || !code) {
      return NextResponse.json(
        { error: "problemId and code are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Authenticate user
    const authResult = await getAuthenticatedUser();
    let user = authResult.user;

    // If guest (not logged in), create or use temporary guest profile for the submission session
    if (!user) {
      user = await User.findOne({ username: "guest_coder" });
      if (!user) {
        user = await User.create({
          username: "guest_coder",
          usernameNormalized: "guest_coder",
          displayName: "Guest Coder",
          provider: "credentials",
          role: "user",
          xp: 0,
          currentStreak: 0,
          longestStreak: 0,
          solvedProblems: [],
          attemptedProblems: [],
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          duelRating: 1000,
          duelsPlayed: 0,
          duelsWon: 0,
          duelsLost: 0,
        });
      }
    }

    const evaluation = await evaluateAndRecordSubmission(
      user,
      problemId,
      language,
      code
    );

    return NextResponse.json(evaluation);
  } catch (err: unknown) {
    console.error("[API POST /api/problems/submit] Error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Submission evaluation failed" },
      { status: 500 }
    );
  }
}
