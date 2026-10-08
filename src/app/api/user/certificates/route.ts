import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserCertificate } from "@/models/UserCertificate";
import { UserLearning } from "@/models/UserLearning";
import { getCourseById } from "@/data/courses";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const certificates = await UserCertificate.find({ userId: session.user.id }).sort({ issuedAt: -1 });
    return NextResponse.json({ success: true, certificates });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await connectToDatabase();
    const learning = await UserLearning.findOne({ userId: session.user.id });

    // Verify all modules in course are completed
    const allModulesDone = course.modules.every(
      (m) => learning?.completedModuleIds.includes(m.moduleId) || learning?.passedQuizIds.includes(m.quiz.quizId)
    );

    if (!allModulesDone) {
      return NextResponse.json(
        { error: "Course not yet fully completed. All module checkpoint quizzes must be passed." },
        { status: 400 }
      );
    }

    let cert = await UserCertificate.findOne({ userId: session.user.id, courseId });
    if (!cert) {
      cert = await UserCertificate.create({
        userId: session.user.id,
        username: session.user.username || "learner",
        displayName: session.user.displayName || session.user.username || "Learner",
        courseId: course.courseId,
        courseTitle: course.title,
        language: course.language,
        certificateId: `BIT-${course.language.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        verificationHash: Math.random().toString(36).substring(2, 12),
        grade: "Passed",
        issuedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, certificate: cert });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
