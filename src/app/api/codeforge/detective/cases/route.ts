import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { DetectiveCaseDoc, DetectiveProgressDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const casesCollection = db.collection<DetectiveCaseDoc>('detective_cases');
    const progCollection = db.collection<DetectiveProgressDoc>('detective_progress');

    const authUser = await getAuthenticatedUser(req);
    const userProgress = authUser
      ? await progCollection.find({ userId: authUser.userId }).toArray()
      : [];
    const progMap = new Map(userProgress.map((p) => [p.caseId, p]));

    const cases = await casesCollection.find().toArray();

    const response = cases.map((c) => {
      const p = progMap.get(c.caseId);
      const unlockedCluesSet = new Set(p?.unlockedClueIds || []);
      const completedTasksSet = new Set(p?.completedTaskIds || []);

      return {
        caseId: c.caseId,
        caseNumber: c.caseNumber,
        title: c.title,
        summary: c.summary,
        briefing: c.briefing,
        difficulty: c.difficulty,
        xpReward: c.xpReward,
        evidenceFiles: c.evidenceFiles || [],
        clues: (c.clues || []).map((clue) => ({
          clueId: clue.clueId,
          title: clue.title,
          hint: unlockedCluesSet.has(clue.clueId) ? clue.hint : '??? [Solve tasks to uncover clue]',
          isUnlocked: unlockedCluesSet.has(clue.clueId),
        })),
        tasks: (c.tasks || []).map((task) => ({
          taskId: task.taskId,
          prompt: task.prompt,
          taskType: task.taskType,
          points: task.points,
          isCompleted: completedTasksSet.has(task.taskId),
        })),
        isSolved: p?.isSolved || false,
      };
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
