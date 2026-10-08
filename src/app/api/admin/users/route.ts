import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult || !authResult.user || authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    await connectToDatabase();

    const filter: Record<string, unknown> = {};
    if (query.trim()) {
      filter.$or = [
        { username: { $regex: query.trim(), $options: "i" } },
        { email: { $regex: query.trim(), $options: "i" } },
        { displayName: { $regex: query.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .select("username displayName email role xp currentStreak duelRating duelsPlayed duelsWon duelsLost solvedProblems createdAt")
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Admin Users] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult || !authResult.user || authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, xp, duelRating } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Valid userId is required" }, { status: 400 });
    }

    await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    if (role && (role === "user" || role === "admin")) {
      updateFields.role = role;
    }
    if (typeof xp === "number" && xp >= 0) {
      updateFields.xp = xp;
    }
    if (typeof duelRating === "number" && duelRating >= 0) {
      updateFields.duelRating = duelRating;
    }

    const updated = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[Admin Users] PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
