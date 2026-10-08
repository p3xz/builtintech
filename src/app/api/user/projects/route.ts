import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserProject } from "@/models/UserProject";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const projects = await UserProject.find({ userId: session.user.id }).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, language, code, visibility, tags } = body;

    if (!title || !language || !code) {
      return NextResponse.json({ error: "Title, language, and code are required." }, { status: 400 });
    }

    await connectToDatabase();
    const newProject = await UserProject.create({
      userId: session.user.id,
      username: session.user.username || "user",
      displayName: session.user.displayName || session.user.username || "Learner",
      title: title.trim(),
      description: description?.trim() || "",
      language,
      code,
      visibility: visibility === "public" ? "public" : "private",
      tags: tags || [language],
    });

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, description, language, code, visibility, tags } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await UserProject.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        $set: {
          ...(title && { title: title.trim() }),
          ...(description !== undefined && { description: description.trim() }),
          ...(language && { language }),
          ...(code && { code }),
          ...(visibility && { visibility }),
          ...(tags && { tags }),
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    await UserProject.findOneAndDelete({ _id: id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
