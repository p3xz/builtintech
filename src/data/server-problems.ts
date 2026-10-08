// Server-only problem data — includes hidden tests, perf probes, reference solutions, judge notes
// NEVER import this from client components
import problemsRaw from './clashjudge-duel-problems.json';

export interface HiddenTest {
  input: Record<string, any>;
  expected: any;
}

export interface PerfProbe {
  description: string;
  generateInput?: string;
  input?: Record<string, any>;
  expected: any;
  timeoutMs: number;
}

export interface ServerProblem {
  id: string;
  title: string;
  difficulty: string;
  statement: string;
  examples: any[];
  hiddenTests: HiddenTest[];
  perfProbe: PerfProbe | null;
  efficiencyTrap: string;
  referenceSolution: string;
  judgeNotes: string;
}

export function getServerProblem(id: string): ServerProblem | undefined {
  return (problemsRaw as ServerProblem[]).find((p) => p.id === id);
}

export function getAllServerProblems(): ServerProblem[] {
  return problemsRaw as ServerProblem[];
}
