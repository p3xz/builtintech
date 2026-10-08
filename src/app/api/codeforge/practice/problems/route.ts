import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PracticeProblemDoc, PracticeSubmissionDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language');
    const category = searchParams.get('category');

    const db = await getDatabase();
    const problemsCollection = db.collection<PracticeProblemDoc>('practice_problems');
    const submissionsCollection = db.collection<PracticeSubmissionDoc>('practice_submissions');

    const authUser = await getAuthenticatedUser(req);
    const solvedProblemIds = authUser
      ? new Set(
          (
            await submissionsCollection
              .find({ userId: authUser.userId, status: 'Accepted' })
              .project({ problemId: 1 })
              .toArray()
          ).map((s) => s.problemId)
        )
      : new Set();

    const filter: any = {};
    if (difficulty) filter.difficulty = difficulty;
    if (language && language.toLowerCase() !== 'all') {
      filter.$or = [{ language: 'all' }, { language: language.toLowerCase() }];
    }
    if (category) filter.category = category;

    const problems = await problemsCollection.find(filter).toArray();

    const response = problems.map((p) => ({
      problemId: p.problemId,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      language: p.language,
      category: p.category,
      tags: p.tags || [],
      description: p.description,
      inputFormat: p.inputFormat,
      outputFormat: p.outputFormat,
      constraints: p.constraints,
      starterCode: p.starterCode,
      visibleTestCases: (p.testCases || []).filter((tc) => !tc.isHidden),
      xpReward: p.xpReward,
      isSolved: solvedProblemIds.has(p.problemId),
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
