import { ICourse, ICourseModule, ILesson, IModuleQuiz, IUserLearningProgress } from "@/types/learning";
import { getAllCourses, getCourseById } from "@/data/courses";

export async function fetchUserProgress(): Promise<IUserLearningProgress | null> {
  try {
    const res = await fetch("/api/user/progress");
    if (res.ok) {
      const data = await res.json();
      return data.progress || null;
    }
  } catch {
    // Return null on failure
  }
  return null;
}

export function getDecoratedCourse(
  course: ICourse,
  progress: IUserLearningProgress | null
): ICourse {
  if (!progress) {
    // If user has no progress, all modules are uncompleted; Module 1 is open, subsequent modules locked
    return {
      ...course,
      isEnrolled: false,
      progressPercent: 0,
      modules: course.modules.map((mod, idx) => ({
        ...mod,
        isCompleted: false,
        isLocked: idx > 0,
        isCurrent: idx === 0,
        lessons: mod.lessons.map((les) => ({
          ...les,
          isCompleted: false,
        })),
      })),
    };
  }

  let totalLessons = 0;
  let completedLessonsCount = 0;

  const modules: ICourseModule[] = course.modules.map((mod, index) => {
    const isCompleted =
      progress.completedModuleIds?.includes(mod.moduleId) ||
      progress.passedQuizIds?.includes(mod.quiz?.quizId || "");

    const prevMod = course.modules[index - 1];
    const isLocked =
      index > 0 &&
      prevMod &&
      !progress.completedModuleIds?.includes(prevMod.moduleId) &&
      !progress.passedQuizIds?.includes(prevMod.quiz?.quizId || "");

    const isCurrent = !isLocked && !isCompleted;

    const lessons: ILesson[] = mod.lessons.map((les) => {
      totalLessons++;
      const isLessonCompleted =
        progress.completedLessonIds?.includes(les.lessonId) || isCompleted;
      if (isLessonCompleted) completedLessonsCount++;
      return {
        ...les,
        isCompleted: isLessonCompleted,
      };
    });

    return {
      ...mod,
      lessons,
      isCompleted,
      isLocked,
      isCurrent,
    };
  });

  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  return {
    ...course,
    modules,
    isEnrolled: progress.enrolledCourseIds?.includes(course.courseId) || false,
    progressPercent,
  };
}

export async function markLessonCompleted(
  courseId: string,
  moduleId: string,
  lessonId: string
): Promise<{ success: boolean; xpAwarded?: number; moduleCompleted?: boolean }> {
  try {
    const res = await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete-lesson", courseId, moduleId, lessonId }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API error
  }
  return { success: false };
}

export async function evaluateModuleQuiz(
  courseId: string,
  moduleId: string,
  quizId: string,
  answers: Record<string, number>
): Promise<{
  passed: boolean;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  xpAwarded: number;
  nextModuleId?: string;
}> {
  try {
    const res = await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit-quiz", courseId, moduleId, quizId, answers }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback error
  }

  return {
    passed: false,
    scorePercent: 0,
    correctCount: 0,
    totalQuestions: 0,
    xpAwarded: 0,
  };
}
