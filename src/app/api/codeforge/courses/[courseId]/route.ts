import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CourseDoc, ModuleDoc, LessonDoc, QuizDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserProgress, checkModuleQuizUnlocked } from '@/lib/services';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const db = await getDatabase();
    const coursesCollection = db.collection<CourseDoc>('courses');
    const modulesCollection = db.collection<ModuleDoc>('modules');
    const lessonsCollection = db.collection<LessonDoc>('lessons');
    const quizzesCollection = db.collection<QuizDoc>('quizzes');

    const course = await coursesCollection.findOne({
      $or: [{ courseId }, { slug: courseId }],
      published: true,
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const authUser = await getAuthenticatedUser(req);
    const progress = authUser ? await getUserProgress(authUser.userId, authUser.email) : null;
    const completedLessonsSet = new Set(progress?.completedLessons || []);
    const completedModulesSet = new Set(progress?.completedModules || []);

    const modules = await modulesCollection
      .find({ courseId: course.courseId, published: true })
      .sort({ ordering: 1 })
      .toArray();

    const modulesWithDetails = await Promise.all(
      modules.map(async (mod, index) => {
        const lessons = await lessonsCollection
          .find({ moduleId: mod.moduleId, published: true })
          .sort({ ordering: 1 })
          .toArray();

        const totalLessons = lessons.length;
        const completedLessons = lessons.filter((l) => completedLessonsSet.has(l.lessonId)).length;
        const isModuleCompleted = completedModulesSet.has(mod.moduleId) || (totalLessons > 0 && completedLessons === totalLessons);

        // Quiz unlock check: only unlocked after all module lessons completed
        const quizUnlocked = totalLessons > 0 && completedLessons === totalLessons;

        const quiz = mod.quizId
          ? await quizzesCollection.findOne({ quizId: mod.quizId, published: true })
          : null;

        return {
          moduleId: mod.moduleId,
          title: mod.title,
          description: mod.description,
          ordering: mod.ordering,
          difficulty: mod.difficulty,
          isCompleted: isModuleCompleted,
          isUnlocked: index === 0 || completedModulesSet.has(modules[index - 1]?.moduleId),
          quiz: quiz
            ? {
                quizId: quiz.quizId,
                title: quiz.title,
                isUnlocked: quizUnlocked,
                isPassed: progress?.passedQuizzes?.includes(quiz.quizId) || false,
                passPercentage: quiz.passPercentage,
                xpReward: quiz.xpReward,
              }
            : null,
          lessons: lessons.map((l) => ({
            lessonId: l.lessonId,
            title: l.title,
            slug: l.slug,
            ordering: l.ordering,
            concepts: l.concepts,
            xpReward: l.xpReward || 25,
            isCompleted: completedLessonsSet.has(l.lessonId),
          })),
        };
      })
    );

    const finalQuiz = await quizzesCollection.findOne({
      courseId: course.courseId,
      quizType: 'course_final',
      published: true,
    });

    return NextResponse.json({
      courseId: course.courseId,
      slug: course.slug,
      title: course.title,
      language: course.language,
      description: course.description,
      difficulty: course.difficulty,
      modules: modulesWithDetails,
      finalQuiz: finalQuiz
        ? {
            quizId: finalQuiz.quizId,
            title: finalQuiz.title,
            isPassed: progress?.passedQuizzes?.includes(finalQuiz.quizId) || false,
            passPercentage: finalQuiz.passPercentage,
          }
        : null,
      isCourseCompleted: progress?.completedCourses?.includes(course.courseId) || false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
