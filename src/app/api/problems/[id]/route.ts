import { NextRequest, NextResponse } from "next/server";
import { getPublicProblem } from "@/lib/problems";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const problem = await getPublicProblem(id);

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const session = await auth();
    const isSolved = Boolean(session?.user?.solvedProblems?.includes(problem.problemId));

    return NextResponse.json({
      problem,
      userState: {
        isSolved,
      },
    });
  } catch (err: unknown) {
    console.error("[API GET /api/problems/[id]] Error:", err);
    return NextResponse.json(
      { error: "Internal server error fetching problem" },
      { status: 500 }
    );
  }
}
