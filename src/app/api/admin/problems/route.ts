import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Question } from "@/models/Question";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    await connectToDatabase();
    const problems = await Question.find().lean();

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("[Admin Problems] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      difficulty,
      description,
      constraints,
      examples,
      hiddenTestCases,
      starterTemplates,
      xp,
    } = body;

    if (!title || !description || !difficulty) {
      return NextResponse.json({ error: "Title, description, and difficulty are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Count existing questions to generate next problemId
    const total = await Question.countDocuments();
    const nextId = String(total + 1);

    const generatedSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/(^-|-$)/g, "");

    const newQuestion = await Question.create({
      problemId: nextId,
      title: title.trim(),
      slug: generatedSlug,
      difficulty: difficulty || "Easy",
      description: description.trim(),
      constraints: Array.isArray(constraints) ? constraints : [],
      examples: Array.isArray(examples) ? examples : [],
      hiddenTestCases: Array.isArray(hiddenTestCases) ? hiddenTestCases : [],
      starterTemplates: starterTemplates || {},
      xp: xp || (difficulty === "Easy" ? 100 : difficulty === "Medium" ? 250 : 500),
      isPublished: true,
    });

    return NextResponse.json({ success: true, problem: newQuestion }, { status: 201 });
  } catch (error: any) {
    console.error("[Admin Problems] POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create problem" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { problemId, isPublished, xp, difficulty } = body;

    if (problemId === undefined) {
      return NextResponse.json({ error: "problemId is required" }, { status: 400 });
    }

    await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    if (typeof isPublished === "boolean") updateFields.isPublished = isPublished;
    if (typeof xp === "number") updateFields.xp = xp;
    if (difficulty) updateFields.difficulty = difficulty;

    const updated = await Question.findOneAndUpdate(
      { problemId: String(problemId) },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, problem: updated });
  } catch (error) {
    console.error("[Admin Problems] PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
