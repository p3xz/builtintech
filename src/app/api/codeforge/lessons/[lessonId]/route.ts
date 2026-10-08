import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { LessonDoc, QuestionDoc, ModuleDoc, CourseDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserProgress } from '@/lib/services';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const db = await getDatabase();
    const lessonsCollection = db.collection<LessonDoc>('lessons');
    const questionsCollection = db.collection<QuestionDoc>('questions');
    const modulesCollection = db.collection<ModuleDoc>('modules');
    const coursesCollection = db.collection<CourseDoc>('courses');

    const lesson = await lessonsCollection.findOne({
      $or: [{ lessonId }, { slug: lessonId }],
      published: true,
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const authUser = await getAuthenticatedUser(req);
    const progress = authUser ? await getUserProgress(authUser.userId, authUser.email) : null;
    const isCompleted = progress?.completedLessons?.includes(lesson.lessonId) || false;

    // Fetch questions associated with this lesson
    // NEVER leak correctAnswer or correctOrder to frontend!
    const questions = await questionsCollection
      .find({
        $or: [{ lessonId: lesson.lessonId }, { questionId: { $in: lesson.questionIds || [] } }],
        published: true,
      })
      .sort({ ordering: 1 })
      .toArray();

    const sanitizedQuestions = questions.map((q) => ({
      questionId: q.questionId,
      questionType: q.questionType,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      ordering: q.ordering,
      template: q.template,
      blocks: q.blocks,
      buggyCode: q.buggyCode,
      codeSnippet: q.codeSnippet,
      starterCode: q.starterCode,
      xpReward: q.xpReward || 30,
      isSolved: progress?.completedExercises?.includes(q.questionId) || false,
    }));

    // Find next & previous lesson in module
    const prevLesson = await lessonsCollection.findOne({
      moduleId: lesson.moduleId,
      ordering: { $lt: lesson.ordering },
      published: true,
    });

    const nextLesson = await lessonsCollection.findOne({
      moduleId: lesson.moduleId,
      ordering: { $gt: lesson.ordering },
      published: true,
    });

    return NextResponse.json({
      lessonId: lesson.lessonId,
      moduleId: lesson.moduleId,
      courseId: lesson.courseId,
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content,
      concepts: lesson.concepts,
      starterCode: lesson.starterCode,
      xpReward: lesson.xpReward || 25,
      isCompleted,
      questions: sanitizedQuestions,
      previousLessonId: prevLesson ? prevLesson.lessonId : null,
      nextLessonId: nextLesson ? nextLesson.lessonId : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
