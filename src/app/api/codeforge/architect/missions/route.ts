import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ArchitectMissionDoc, ArchitectProgressDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const missionsCollection = db.collection<ArchitectMissionDoc>('architect_missions');
    const progCollection = db.collection<ArchitectProgressDoc>('architect_progress');

    const authUser = await getAuthenticatedUser(req);
    const userProgress = authUser
      ? await progCollection.find({ userId: authUser.userId }).toArray()
      : [];
    const progMap = new Map(userProgress.map((p) => [p.missionId, p]));

    const missions = await missionsCollection.find().toArray();

    const response = missions.map((m) => {
      const p = progMap.get(m.missionId);
      const completedSet = new Set(p?.completedPhases || []);

      return {
        missionId: m.missionId,
        title: m.title,
        slug: m.slug,
        summary: m.summary,
        architectureOverview: m.architectureOverview,
        language: m.language,
        difficulty: m.difficulty,
        totalPhases: m.totalPhases,
        completedPhasesCount: completedSet.size,
        currentPhase: p?.currentPhase || 1,
        isCompleted: p?.isCompleted || false,
        xpReward: m.xpReward,
        phases: (m.phases || []).map((phase) => ({
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          requirements: phase.requirements,
          starterCode: phase.starterCode,
          hints: phase.hints || [],
          isCompleted: completedSet.has(phase.phaseNumber),
          savedCode: p?.phaseCodes?.[String(phase.phaseNumber)] || null,
        })),
      };
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
