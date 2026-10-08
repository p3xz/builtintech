import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { QuestionDoc } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    const db = await getDatabase();
    const questionsCollection = db.collection<QuestionDoc>('questions');

    const questionId = body.questionId || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newQuestion: QuestionDoc = {
      ...body,
      questionId,
      published: body.published ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await questionsCollection.insertOne(newQuestion);
    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('Authentication') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { questionId, updates } = body;

    const db = await getDatabase();
    const questionsCollection = db.collection<QuestionDoc>('questions');

    await questionsCollection.updateOne(
      { questionId },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: 'Question updated successfully' });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection('questions').deleteOne({ questionId });

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
