import { NextRequest, NextResponse } from "next/server";
import { getCourseById } from "@/data/courses";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, courseId, moduleId, lessonId, quizId, answers } = body;

    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (action === "complete-lesson") {
      const targetModule = course.modules.find((m) => m.moduleId === moduleId);
      const isLastLesson = targetModule?.lessons[targetModule.lessons.length - 1]?.lessonId === lessonId;

      return NextResponse.json({
        success: true,
        xpAwarded: 25,
        moduleCompleted: isLastLesson,
      });
    }

    if (action === "submit-quiz") {
      const targetModule = course.modules.find((m) => m.moduleId === moduleId);
      const quiz = targetModule?.quiz;

      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      let correctCount = 0;
      quiz.questions.forEach((q) => {
        if (answers && answers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });

      const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = scorePercent >= quiz.passingScorePercent;

      // Find next module if passed
      let nextModuleId: string | undefined = undefined;
      if (passed) {
        const currentIdx = course.modules.findIndex((m) => m.moduleId === moduleId);
        if (currentIdx !== -1 && currentIdx + 1 < course.modules.length) {
          nextModuleId = course.modules[currentIdx + 1].moduleId;
        }
      }

      return NextResponse.json({
        success: true,
        passed,
        scorePercent,
        correctCount,
        totalQuestions: quiz.questions.length,
        xpAwarded: passed ? quiz.xpReward : 0,
        nextModuleId,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server processing error" }, { status: 500 });
  }
}
