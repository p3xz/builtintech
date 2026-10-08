import { IDailyMission, CourseLevel, SupportedLanguage } from "@/types/learning";
import { getCourseByLanguageAndLevel } from "@/data/courses";

export function calculateLevelFromXp(xp: number): {
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, xp || 0);
  let level = 1;
  let remainingXp = safeXp;
  let threshold = 250;

  while (remainingXp >= threshold) {
    remainingXp -= threshold;
    level++;
    threshold = level * 250;
  }

  const progressPercent = threshold > 0 ? Math.min(100, Math.round((remainingXp / threshold) * 100)) : 0;

  return {
    level,
    xpInCurrentLevel: remainingXp,
    xpForNextLevel: threshold,
    progressPercent,
  };
}

export async function saveOnboardingPreferences(
  language: SupportedLanguage,
  experience: CourseLevel
): Promise<{ courseId: string; moduleId: string; lessonId: string }> {
  const matchedCourse = getCourseByLanguageAndLevel(language, experience);
  const targetCourseId = matchedCourse?.courseId || "python-fundamentals";
  const targetModuleId = matchedCourse?.modules[0]?.moduleId || "python-basics";
  const targetLessonId = matchedCourse?.modules[0]?.lessons[0]?.lessonId || "what-is-python";

  try {
    await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save-onboarding",
        preferredLanguage: language,
        experienceLevel: experience,
        courseId: targetCourseId,
        moduleId: targetModuleId,
        lessonId: targetLessonId,
      }),
    });
  } catch {
    // Handled
  }

  return {
    courseId: targetCourseId,
    moduleId: targetModuleId,
    lessonId: targetLessonId,
  };
}
