import { IArchitectMission } from "@/types/learning";
import { getAllArchitectMissions, getArchitectMissionById } from "@/data/architect-missions";

const ARCHITECT_PROGRESS_KEY = "builtintech_architect_progress_v1";

export function getArchitectMissionsWithStatus(): IArchitectMission[] {
  const missions = getAllArchitectMissions();
  if (typeof window === "undefined") return missions;

  const completedPhasesMap: Record<string, number[]> = JSON.parse(
    localStorage.getItem(ARCHITECT_PROGRESS_KEY) || "{}"
  );

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

  if (allPassed && typeof window !== "undefined") {
    const map: Record<string, number[]> = JSON.parse(localStorage.getItem(ARCHITECT_PROGRESS_KEY) || "{}");
    if (!map[missionId]) map[missionId] = [];
    if (!map[missionId].includes(phaseNumber)) {
      map[missionId].push(phaseNumber);
      localStorage.setItem(ARCHITECT_PROGRESS_KEY, JSON.stringify(map));
    }
  }

  return {
    allPassed,
    testResults,
    xpAwarded: allPassed ? phase.xp : 0,
  };
}
