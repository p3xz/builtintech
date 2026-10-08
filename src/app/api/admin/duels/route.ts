import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DuelRoom } from "@/models/DuelRoom";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    await connectToDatabase();
    const duels = await DuelRoom.find().sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({ duels });
  } catch (error) {
    console.error("[Admin Duels] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
