export type PlayerStatus = "CODING" | "SUBMITTED" | "SOLVED";

export type PlayerState = {
  name: string;
  code: string;
  status: PlayerStatus;
  testsPassed: number;
  totalTests: number;
  submittedAt?: number;
};

export type RoomStatus = "WAITING" | "ACTIVE" | "FINISHED";

export type PlayerReadability = {
  score: number; // 1-10
  reason: string;
};

export type PlayerFeedback = {
  mistakes: string[];
  improvements: string[];
  betterApproach: string;
};

export type PlayerJudgeScore = {
  name: string;
  testsPassed: number;
  totalTests: number;
  runtimeMs: number;
  readability: PlayerReadability;
  feedback: PlayerFeedback;
};

export type JudgeResult = {
  winner: string | null; // winner name or null for tie
  verdict: string; // max 4 lines commentator style
  player1: PlayerJudgeScore;
  player2: PlayerJudgeScore;
  judgedAt: number;
};

export type Room = {
  roomCode: string; // 6-char uppercase alphanumeric, e.g. "XK7Q2M"
  problemId: string;
  status: RoomStatus;
  endsAt?: number; // server timestamp ms, set when player 2 joins
  player1: PlayerState;
  player2?: PlayerState;
  judgeResult?: JudgeResult;
};

// Client-safe room representation for polling
export type ClientPlayerState = {
  name: string;
  code?: string; // only provided if requester is this player OR duel is FINISHED
  status: PlayerStatus;
  testsPassed: number;
  totalTests: number;
  submittedAt?: number;
};

export type ClientRoom = {
  roomCode: string;
  problemId: string;
  status: RoomStatus;
  endsAt?: number;
  player1: ClientPlayerState;
  player2?: ClientPlayerState;
  judgeResult?: JudgeResult;
};
