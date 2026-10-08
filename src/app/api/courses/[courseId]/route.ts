import { NextRequest, NextResponse } from "next/server";
import { getCourseById } from "@/data/courses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = getCourseById(courseId);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve course" }, { status: 500 });
  }
}
