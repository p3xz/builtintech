// Client-safe problem data — NO hidden tests, perf probes, reference solutions, or judge notes
import problemsRaw from './clashjudge-duel-problems.json';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface ClientProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  examples: Example[];
}

export const problems: ClientProblem[] = problemsRaw.map((p: any) => ({
  id: p.id,
  title: p.title,
  difficulty: p.difficulty,
  statement: p.statement,
  examples: p.examples,
}));
