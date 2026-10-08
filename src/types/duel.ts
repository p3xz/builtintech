export interface DuelPlayer {
  nickname: string;
  code: string;
  submitted: boolean;
  submittedAt?: number;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

export interface PlayerResults {
  nickname: string;
  testResults: TestResult[];
  correctness: number; // tests passed out of total
  totalTests: number;
  runtimeMs: number; // wall-clock on heaviest test
  readabilityScore: number; // 1-10
  readabilityReason: string;
  error?: string;
}

export interface DuelVerdict {
  winner: string | null; // null = tie
  verdictText: string;
  referenceSolution: string;
}

export interface DuelState {
  id: string;
  problemId: string;
  player1: DuelPlayer;
  player2: DuelPlayer;
  status: 'waiting' | 'in-progress' | 'judging' | 'complete';
  startedAt: number;
  timeLimit: number; // ms
  results?: {
    player1: PlayerResults;
    player2: PlayerResults;
    verdict: DuelVerdict;
  };
}

export interface CreateDuelRequest {
  player1Nickname: string;
  player2Nickname: string;
  problemId: string;
}

export interface SubmitCodeRequest {
  duelId: string;
  playerNumber: 1 | 2;
  code: string;
}

export interface DuelStatusResponse {
  status: DuelState['status'];
  player1Submitted: boolean;
  player2Submitted: boolean;
  results?: DuelState['results'];
}
