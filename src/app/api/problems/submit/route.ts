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
    if (!authResult.user) {
      return NextResponse.json(
        { error: "Authentication required to submit solutions. Please sign in with Google." },
        { status: 401 }
      );
    }
    const user = authResult.user;

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
