import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ModuleDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { evaluateQuizSubmission } from '@/lib/services';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId } = await params;
    const db = await getDatabase();
    const modulesCollection = db.collection<ModuleDoc>('modules');

    const mod = await modulesCollection.findOne({ moduleId, published: true });
    if (!mod || !mod.quizId) {
      return NextResponse.json({ error: 'Quiz not found for this module' }, { status: 404 });
    }

    const body = await req.json();
    const { answers } = body; // Record<questionId, string>

    const result = await evaluateQuizSubmission(
      authUser.userId,
      authUser.email,
      mod.quizId,
      answers || {}
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
