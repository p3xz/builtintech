import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PracticeProblemDoc, PracticeSubmissionDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { runCodeTestsLocally } from '@/lib/engine';
import { awardXP, updateStreak, recordMissionProgress, checkAndUnlockAchievements } from '@/lib/services';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemId } = await params;
    const body = await req.json();
    const { language, code } = body;

    const db = await getDatabase();
    const problemsCollection = db.collection<PracticeProblemDoc>('practice_problems');
    const submissionsCollection = db.collection<PracticeSubmissionDoc>('practice_submissions');

    const problem = await problemsCollection.findOne({
      $or: [{ problemId }, { slug: problemId }],
    });

    if (!problem) {
      return NextResponse.json({ error: 'Practice problem not found' }, { status: 404 });
    }

    const testResults = runCodeTestsLocally(language, code, problem.testCases || []);
    const status = testResults.allPassed ? 'Accepted' : 'Wrong Answer';

    let xpAwarded = 0;
    if (status === 'Accepted') {
      const xpRes = await awardXP(
        authUser.userId,
        problem.xpReward || 50,
        'practice_problem',
        problem.problemId,
        `Solved Problem: ${problem.title}`,
        true,
        10
      );
      xpAwarded = xpRes.xpAwarded;
      await updateStreak(authUser.userId);
      await recordMissionProgress(authUser.userId, 'solve_practice', 1);
      await checkAndUnlockAchievements(authUser.userId);
    }

    const mappedResults = testResults.results.map((r) => ({
      name: r.name,
      passed: r.passed,
      input: r.input,
      expectedOutput: r.expectedOutput,
      actualOutput: r.actualOutput,
      error: r.error || undefined,
    }));

    const submissionDoc: PracticeSubmissionDoc = {
      submissionId: `sub_${Date.now()}`,
      userId: authUser.userId,
      problemId: problem.problemId,
      language,
      code,
      status,
      passedTestsCount: testResults.passedTests,
      totalTestsCount: testResults.totalTests,
      runtimeMs: testResults.totalTimeMs,
      testResults: mappedResults,
      xpAwarded,
      createdAt: new Date(),
    };

    await submissionsCollection.insertOne(submissionDoc);

    return NextResponse.json({
      status,
      passedTestsCount: testResults.passedTests,
      totalTestsCount: testResults.totalTests,
      runtimeMs: testResults.totalTimeMs,
      testResults: mappedResults,
      xpAwarded,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
