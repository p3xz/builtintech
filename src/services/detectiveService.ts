import { IDetectiveCase } from "@/types/learning";
import { getAllDetectiveCases, getDetectiveCaseById } from "@/data/detective-cases";

export async function getDetectiveCasesWithStatus(): Promise<IDetectiveCase[]> {
  const cases = getAllDetectiveCases();
  try {
    const res = await fetch("/api/user/progress");
    if (res.ok) {
      const data = await res.json();
      const solvedCases: string[] = data.progress?.solvedCases || [];
      return cases.map((c) => ({
        ...c,
        isSolved: solvedCases.includes(c.id),
      }));
    }
  } catch {
    // Return base cases if API fails
  }

  return cases.map((c) => ({
    ...c,
    isSolved: false,
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

export async function markDetectiveCaseSolved(caseId: string): Promise<void> {
  try {
    await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "solve-case", caseId }),
    });
  } catch {
    // API failure
  }
}
