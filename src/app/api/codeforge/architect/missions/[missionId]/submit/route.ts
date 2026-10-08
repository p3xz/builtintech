import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ArchitectMissionDoc, ArchitectProgressDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { executeCodeLocally } from '@/lib/engine';
import { awardXP, updateStreak, checkAndUnlockAchievements } from '@/lib/services';

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
    const body = await req.json();
    const { phaseNumber, code } = body;

    const db = await getDatabase();
    const missionsCollection = db.collection<ArchitectMissionDoc>('architect_missions');
    const progCollection = db.collection<ArchitectProgressDoc>('architect_progress');

    const mission = await missionsCollection.findOne({ missionId });
    if (!mission) {
      return NextResponse.json({ error: 'Architect mission not found' }, { status: 404 });
    }

    const targetPhase = (mission.phases || []).find((p) => p.phaseNumber === Number(phaseNumber));
    if (!targetPhase) {
      return NextResponse.json({ error: `Phase ${phaseNumber} not found in mission` }, { status: 404 });
    }

    // Execute code with phase test suite
    const fullScript = `${code}\n\n${targetPhase.testSuiteCode}`;
    const execRes = executeCodeLocally(mission.language || 'python', fullScript);
    const passed = execRes.exitCode === 0 && !execRes.error;

    let prog = await progCollection.findOne({ userId: authUser.userId, missionId });
    if (!prog) {
      const newProg: ArchitectProgressDoc = {
        userId: authUser.userId,
        missionId,
        currentPhase: 1,
        completedPhases: [],
        phaseCodes: {},
        phaseTestResults: {},
        isCompleted: false,
        updatedAt: new Date(),
      };
      const res = await progCollection.insertOne(newProg);
      prog = { ...newProg, _id: res.insertedId };
    }

    const completed = new Set(prog.completedPhases || []);
    const codesMap = { ...(prog.phaseCodes || {}), [String(phaseNumber)]: code };
    const resultsMap = {
      ...(prog.phaseTestResults || {}),
      [String(phaseNumber)]: { passed, stdout: execRes.stdout, stderr: execRes.stderr },
    };

    if (passed) {
      completed.add(Number(phaseNumber));
    }

    const totalPhases = mission.totalPhases || mission.phases.length;
    const isCompleted = completed.size >= totalPhases;
    let nextPhase = null;

    let currentPhase = prog.currentPhase || 1;
    if (passed && Number(phaseNumber) < totalPhases) {
      nextPhase = Number(phaseNumber) + 1;
      currentPhase = Math.max(currentPhase, nextPhase);
    }

    let xpAwarded = 0;
    if (isCompleted && !prog.isCompleted) {
      const xpRes = await awardXP(
        authUser.userId,
        mission.xpReward || 250,
        'architect_mission',
        missionId,
        `Architect Mission Completed: ${mission.title}`
      );
      xpAwarded = xpRes.xpAwarded;
      await updateStreak(authUser.userId);
      await checkAndUnlockAchievements(authUser.userId);
    }

    await progCollection.updateOne(
      { userId: authUser.userId, missionId },
      {
        $set: {
          completedPhases: Array.from(completed),
          phaseCodes: codesMap,
          phaseTestResults: resultsMap,
          currentPhase,
          isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
          xpAwarded: (prog.xpAwarded || 0) + xpAwarded,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      phaseNumber,
      passed,
      output: execRes.stdout || execRes.stderr,
      error: execRes.error,
      nextPhase,
      missionCompleted: isCompleted,
      xpAwarded,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
