import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserDoc, AchievementDoc, UserAchievementDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { getLevelProgress, getUserProgress } from '@/lib/services';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection<UserDoc>('users');
    const userAchCollection = db.collection<UserAchievementDoc>('user_achievements');
    const achCollection = db.collection<AchievementDoc>('achievements');

    const user = await usersCollection.findOne({
      $or: [{ _id: ObjectId.isValid(authUser.userId) ? new ObjectId(authUser.userId) : undefined }, { email: authUser.email }],
    });

    const xp = user?.xp || 0;
    const levelInfo = getLevelProgress(xp);
    const progress = await getUserProgress(authUser.userId, authUser.email);

    const totalAchievements = await achCollection.countDocuments();
    const unlockedAchievements = await userAchCollection.countDocuments({ userId: authUser.userId });

    const todayStr = new Date().toISOString().split('T')[0];
    const isStreakActiveToday = user?.lastActivityDate
      ? user.lastActivityDate.toISOString().split('T')[0] === todayStr
      : false;

    return NextResponse.json({
      userId: authUser.userId,
      email: authUser.email,
      name: user?.name || authUser.name,
      experienceLevel: user?.experienceLevel || 'Beginner',
      selectedLanguages: user?.selectedLanguages || ['python'],
      xp,
      level: levelInfo.level,
      xpForCurrentLevel: levelInfo.xpForCurrentLevel,
      xpForNextLevel: levelInfo.xpForNextLevel,
      levelProgressPercentage: levelInfo.levelProgressPercentage,
      streak: {
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        isStreakActiveToday,
      },
      completedLessonsCount: progress.completedLessons?.length || 0,
      completedModulesCount: progress.completedModules?.length || 0,
      completedCoursesCount: progress.completedCourses?.length || 0,
      unlockedAchievementsCount: unlockedAchievements,
      totalAchievementsCount: totalAchievements,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
