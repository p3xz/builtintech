import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ModuleDoc, QuizDoc, QuestionDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkModuleQuizUnlocked, getUserProgress } from '@/lib/services';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const modulesCollection = db.collection<ModuleDoc>('modules');
    const quizzesCollection = db.collection<QuizDoc>('quizzes');
    const questionsCollection = db.collection<QuestionDoc>('questions');

    const mod = await modulesCollection.findOne({ moduleId, published: true });
    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // GATING CHECK: Verify module is complete
    const gateCheck = await checkModuleQuizUnlocked(authUser.userId, authUser.email, moduleId);

    if (!mod.quizId) {
      return NextResponse.json({ error: 'No quiz configured for this module' }, { status: 404 });
    }

    const quiz = await quizzesCollection.findOne({ quizId: mod.quizId, published: true });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const progress = await getUserProgress(authUser.userId, authUser.email);
    const isPassed = progress?.passedQuizzes?.includes(quiz.quizId) || false;

    if (!gateCheck.isUnlocked) {
      return NextResponse.json({
        quizId: quiz.quizId,
        title: quiz.title,
        description: quiz.description,
        isUnlocked: false,
        isPassed,
        gateMessage: `Progression Gate: Complete all ${gateCheck.totalLessons} module lessons to unlock this quiz (${gateCheck.completedLessons}/${gateCheck.totalLessons} completed).`,
        questions: [],
      });
    }

    // If unlocked, return questions WITHOUT correct answers!
    const questions = await questionsCollection
      .find({ questionId: { $in: quiz.questionIds }, published: true })
      .sort({ ordering: 1 })
      .toArray();

    const sanitizedQuestions = questions.map((q) => ({
      questionId: q.questionId,
      questionType: q.questionType,
      questionText: q.questionText,
      options: q.options || [],
      ordering: q.ordering,
      codeSnippet: q.codeSnippet,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({
      quizId: quiz.quizId,
      moduleId: quiz.moduleId,
      courseId: quiz.courseId,
      title: quiz.title,
      description: quiz.description,
      passPercentage: quiz.passPercentage,
      xpReward: quiz.xpReward,
      isUnlocked: true,
      isPassed,
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
