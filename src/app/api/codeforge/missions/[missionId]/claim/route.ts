import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { DailyMissionDoc, UserMissionDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { awardXP, checkAndUnlockAchievements } from '@/lib/services';
import { ObjectId } from 'mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { missionId } = await params;
    const db = await getDatabase();
    const missionsCollection = db.collection<DailyMissionDoc>('daily_missions');
    const userMissionsCollection = db.collection<UserMissionDoc>('user_missions');

    const mission = await missionsCollection.findOne({
      _id: ObjectId.isValid(missionId) ? new ObjectId(missionId) : undefined,
    });

    if (!mission) {
      return NextResponse.json({ error: 'Daily mission not found' }, { status: 404 });
    }

    const um = await userMissionsCollection.findOne({
      userId: authUser.userId,
      missionId,
    });

    if (!um || !um.isCompleted) {
      return NextResponse.json({ error: 'Mission is not completed yet' }, { status: 400 });
    }

    if (um.claimedReward) {
      return NextResponse.json({ error: 'Mission reward has already been claimed' }, { status: 400 });
    }

    await userMissionsCollection.updateOne(
      { _id: um._id },
      { $set: { claimedReward: true, updatedAt: new Date() } }
    );

    const xpRes = await awardXP(
      authUser.userId,
      mission.xpReward || 50,
      'daily_mission',
      missionId,
      `Completed Daily Mission: ${mission.title}`
    );

    await checkAndUnlockAchievements(authUser.userId);

    return NextResponse.json({
      success: true,
      missionId,
      xpAwarded: xpRes.xpAwarded,
      newTotalXp: xpRes.newTotalXp,
      message: 'Mission reward claimed successfully!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
