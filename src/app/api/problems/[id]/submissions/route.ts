import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Submission } from "@/models/Submission";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Problem ID is required" }, { status: 400 });
    }

    const authResult = await getAuthenticatedUser();
    if (!authResult.user) {
      return NextResponse.json({ submissions: [] });
    }

    await connectToDatabase();

    const submissions = await Submission.find({
      userId: authResult.user._id.toString(),
      problemId: id,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("status language runtime testsPassed totalTests createdAt")
      .lean();

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s._id.toString(),
        status: s.status,
        language: s.language,
        runtime: s.runtime || 0,
        testsPassed: s.testsPassed || 0,
        totalTests: s.totalTests || 0,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Problem Submissions] Error:", error);
    return NextResponse.json({ error: "Failed to fetch submission history" }, { status: 500 });
  }
}
