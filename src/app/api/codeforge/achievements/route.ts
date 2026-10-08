import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { AchievementDoc, UserAchievementDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkAndUnlockAchievements } from '@/lib/services';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger achievement condition checks
    await checkAndUnlockAchievements(authUser.userId);

    const db = await getDatabase();
    const achCollection = db.collection<AchievementDoc>('achievements');
    const userAchCollection = db.collection<UserAchievementDoc>('user_achievements');

    const achievements = await achCollection.find().toArray();
    const userUnlocked = await userAchCollection.find({ userId: authUser.userId }).toArray();
    const userMap = new Map(userUnlocked.map((u) => [u.achievementCode, u.unlockedAt]));

    const response = achievements.map((a) => ({
      code: a.code,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category,
      xpReward: a.xpReward,
      isUnlocked: userMap.has(a.code),
      unlockedAt: userMap.get(a.code) || null,
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
