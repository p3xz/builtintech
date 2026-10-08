import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserProject } from "@/models/UserProject";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const language = searchParams.get("language") || "all";

    await connectToDatabase();

    const query: Record<string, unknown> = { visibility: "public" };

    if (language !== "all") {
      query.language = language;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { username: { $regex: search.trim(), $options: "i" } },
        { tags: { $in: [new RegExp(search.trim(), "i")] } },
      ];
    }

    const projects = await UserProject.find(query).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch public projects" }, { status: 500 });
  }
}
