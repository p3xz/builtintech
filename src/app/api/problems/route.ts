import { NextRequest, NextResponse } from "next/server";
import { getAllPublishedProblems } from "@/lib/problems";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty") || "All";
    const search = searchParams.get("search") || "";

    const session = await auth();
    const solvedProblemIds = session?.user?.solvedProblems || [];

    const problems = await getAllPublishedProblems({ difficulty, search });

    const formatted = problems.map((prob) => ({
      _id: prob._id,
      problemId: prob.problemId,
      title: prob.title,
      slug: prob.slug,
      difficulty: prob.difficulty,
      tags: prob.tags,
      xp: prob.xp,
      isSolved: solvedProblemIds.includes(prob.problemId),
    }));

    return NextResponse.json({
      problems: formatted,
      total: formatted.length,
    });
  } catch (err: unknown) {
    console.error("[API GET /api/problems] Error:", err);
    return NextResponse.json(
      { error: "Internal server error fetching problems" },
      { status: 500 }
    );
  }
}
