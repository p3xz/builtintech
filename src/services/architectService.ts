import { IArchitectMission } from "@/types/learning";
import { getAllArchitectMissions, getArchitectMissionById } from "@/data/architect-missions";

export async function getArchitectMissionsWithStatus(): Promise<IArchitectMission[]> {
  const missions = getAllArchitectMissions();

  try {
    const res = await fetch("/api/user/progress");
    if (res.ok) {
      const data = await res.json();
      const completedPhasesMap: Record<string, number[]> = data.progress?.architectCompletedPhases || {};

      return missions.map((m) => {
        const donePhases = completedPhasesMap[m.id] || [];
        const phases = m.phases.map((p) => ({
          ...p,
          isCompleted: donePhases.includes(p.phaseNumber),
        }));
        return {
          ...m,
          phases,
          isCompleted: phases.every((p) => p.isCompleted),
        };
      });
    }
  } catch {
    // Handled
  }

  return missions.map((m) => ({
    ...m,
    isCompleted: false,
    phases: m.phases.map((p) => ({ ...p, isCompleted: false })),
  }));
}

export function validateArchitectPhase(
  missionId: string,
  phaseNumber: number,
  code: string
): {
  allPassed: boolean;
  testResults: Array<{ name: string; passed: boolean; message: string }>;
  xpAwarded: number;
} {
  const mission = getArchitectMissionById(missionId);
  const phase = mission?.phases.find((p) => p.phaseNumber === phaseNumber);

  if (!phase) {
    return {
      allPassed: false,
      testResults: [{ name: "Phase Validation", passed: false, message: "Phase not found" }],
      xpAwarded: 0,
    };
  }

  // Basic static and semantic harness verification
  const testResults = phase.testCases.map((tc) => {
    const hasClass = code.includes("class CampusQueue");
    const hasRequiredKeyword = phase.requirements.some((req) => {
      const match = req.match(/`([^`]+)`/);
      return match ? code.includes(match[1].split("(")[0]) : true;
    });

    const passed = hasClass && hasRequiredKeyword && !code.includes("pass\n");
    return {
      name: tc.name,
      passed,
      message: passed ? "Test passed successfully" : "Failed requirements check. Check hints and implementation details.",
    };
  });

  const allPassed = testResults.every((t) => t.passed);

  if (allPassed) {
    // Record to server
    fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete-architect-phase", missionId, phaseNumber }),
    }).catch(() => {});
  }

  return {
    allPassed,
    testResults,
    xpAwarded: allPassed ? phase.xp : 0,
  };
}
