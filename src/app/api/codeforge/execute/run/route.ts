import { NextRequest, NextResponse } from 'next/server';
import { executeCodeLocally } from '@/lib/engine';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateStreak, recordMissionProgress, checkAndUnlockAchievements } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, stdin } = body;

    if (!language || !code) {
      return NextResponse.json({ error: 'Language and code are required' }, { status: 400 });
    }

    const result = executeCodeLocally(language, code, stdin || '');

    const authUser = await getAuthenticatedUser(req);
    if (authUser && result.exitCode === 0) {
      await updateStreak(authUser.userId);
      await recordMissionProgress(authUser.userId, 'run_code', 1);
      await checkAndUnlockAchievements(authUser.userId);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
