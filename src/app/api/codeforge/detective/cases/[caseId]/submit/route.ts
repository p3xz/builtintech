import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { DetectiveCaseDoc, DetectiveProgressDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { awardXP, updateStreak, checkAndUnlockAchievements } from '@/lib/services';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId } = await params;
    const body = await req.json();
    const { taskId, answer } = body;

    const db = await getDatabase();
    const casesCollection = db.collection<DetectiveCaseDoc>('detective_cases');
    const progCollection = db.collection<DetectiveProgressDoc>('detective_progress');

    const detectiveCase = await casesCollection.findOne({ caseId });
    if (!detectiveCase) {
      return NextResponse.json({ error: 'Detective case not found' }, { status: 404 });
    }

    const targetTask = (detectiveCase.tasks || []).find((t) => t.taskId === taskId);
    if (!targetTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isCorrect = String(answer).trim().toLowerCase() === String(targetTask.expectedAnswer).trim().toLowerCase();

    let prog = await progCollection.findOne({ userId: authUser.userId, caseId });
    if (!prog) {
      const newProg: DetectiveProgressDoc = {
        userId: authUser.userId,
        caseId,
        completedTaskIds: [],
        unlockedClueIds: [],
        taskAnswers: {},
        isSolved: false,
        updatedAt: new Date(),
      };
      const res = await progCollection.insertOne(newProg);
      prog = { ...newProg, _id: res.insertedId };
    }

    const completed = new Set(prog.completedTaskIds || []);
    const answersMap = { ...(prog.taskAnswers || {}), [taskId]: answer };

    let clueUnlocked = null;
    let unlockedClueIds = prog.unlockedClueIds ? [...prog.unlockedClueIds] : [];
    if (isCorrect) {
      completed.add(taskId);
      // Unlock next clue if available
      const clues = detectiveCase.clues || [];
      for (const cl of clues) {
        if (!unlockedClueIds.includes(cl.clueId)) {
          clueUnlocked = cl;
          unlockedClueIds.push(cl.clueId);
          break;
        }
      }
    }

    const totalTasks = (detectiveCase.tasks || []).length;
    const isSolved = completed.size >= totalTasks && totalTasks > 0;
    let xpAwarded = 0;

    if (isSolved && !prog.isSolved) {
      const xpRes = await awardXP(
        authUser.userId,
        detectiveCase.xpReward || 150,
        'detective_case',
        caseId,
        `Solved Case: ${detectiveCase.title}`
      );
      xpAwarded = xpRes.xpAwarded;
      await updateStreak(authUser.userId);
      await checkAndUnlockAchievements(authUser.userId);
    }

    await progCollection.updateOne(
      { userId: authUser.userId, caseId },
      {
        $set: {
          completedTaskIds: Array.from(completed),
          unlockedClueIds,
          taskAnswers: answersMap,
          isSolved,
          solvedAt: isSolved ? new Date() : undefined,
          xpAwarded: (prog.xpAwarded || 0) + xpAwarded,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      taskId,
      isCorrect,
      caseSolved: isSolved,
      xpAwarded,
      unlockedClue: clueUnlocked,
      message: isCorrect ? 'Finding verified successfully!' : 'Incorrect finding. Check server logs again.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
