import { IDetectiveCase } from "@/types/learning";
import { getAllDetectiveCases, getDetectiveCaseById } from "@/data/detective-cases";

const DETECTIVE_SOLVED_KEY = "builtintech_detective_solved_v1";

export function getDetectiveCasesWithStatus(): IDetectiveCase[] {
  const cases = getAllDetectiveCases();
  if (typeof window === "undefined") return cases;

  const solvedIds = JSON.parse(localStorage.getItem(DETECTIVE_SOLVED_KEY) || "[]");
  return cases.map((c) => ({
    ...c,
    isSolved: solvedIds.includes(c.id),
  }));
}

export function evaluateDetectiveTask(
  caseId: string,
  taskId: string,
  answer: string | number
): { correct: boolean; feedback: string; xpAwarded: number } {
  const currentCase = getDetectiveCaseById(caseId);
  if (!currentCase) {
    return { correct: false, feedback: "Case not found.", xpAwarded: 0 };
  }

  const task = currentCase.tasks.find((t) => t.id === taskId);
  if (!task) {
    return { correct: false, feedback: "Task not found in case dossier.", xpAwarded: 0 };
  }

  let correct = false;

  if (task.type === "choice") {
    correct = Number(answer) === task.correctOptionIndex;
  } else if (task.type === "text") {
    correct = String(answer).trim().toLowerCase() === String(task.expectedAnswer).trim().toLowerCase();
  } else if (task.type === "query") {
    const rawAnswer = String(answer).toUpperCase();
    correct = task.expectedKeywords?.every((kw) => rawAnswer.includes(kw.toUpperCase())) || false;
  }

  if (correct) {
    return {
      correct: true,
      feedback: "Correct deduction! Clue verified against log evidence.",
      xpAwarded: task.xp,
    };
  }

  return {
    correct: false,
    feedback: `Deduction inaccurate. Hint: ${task.hint}`,
    xpAwarded: 0,
  };
}

export function markDetectiveCaseSolved(caseId: string): void {
  if (typeof window !== "undefined") {
    const solvedIds: string[] = JSON.parse(localStorage.getItem(DETECTIVE_SOLVED_KEY) || "[]");
    if (!solvedIds.includes(caseId)) {
      solvedIds.push(caseId);
      localStorage.setItem(DETECTIVE_SOLVED_KEY, JSON.stringify(solvedIds));
    }
  }
}
