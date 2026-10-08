import { NextResponse } from "next/server";
import { getAllCourses } from "@/data/courses";

export async function GET() {
  try {
    const courses = getAllCourses();
    return NextResponse.json({ success: true, courses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve courses" }, { status: 500 });
  }
}
