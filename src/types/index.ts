export type DifficultyLevel = "Very Easy" | "Easy" | "Medium" | "Hard";

export type SubmissionStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Compilation Error"
  | "Runtime Error"
  | "Time Limit Exceeded"
  | "System Error";

export interface IUserPreferences {
  editorFontSize: number;
  minimap: boolean;
  defaultLanguage: string;
  reducedMotion?: boolean;
}

export interface IUser {
  _id: string;
  username: string;
  usernameNormalized: string;
  displayName: string;
  email?: string;
  image?: string;
  provider: string; // "google" | "email"
  providerAccountId?: string;
  role: "user" | "admin";
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  solvedProblems: string[]; // problemIds
  attemptedProblems: string[];
  totalSubmissions: number;
  acceptedSubmissions: number;
  duelRating: number;
  duelsPlayed: number;
  duelsWon: number;
  duelsLost: number;
  termsAccepted?: boolean;
  privacyPolicyAccepted?: boolean;
  preferences?: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExampleCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface IHiddenTestCase {
  input: string;
  expectedOutput: string;
}

export interface IStarterTemplates {
  python?: string;
  javascript?: string;
  c?: string;
  cpp?: string;
  java?: string;
}

export interface IQuestion {
  _id: string;
  problemId: string;
  title: string;
  slug: string;
  difficulty: DifficultyLevel;
  description: string;
  constraints: string[];
  examples: IExampleCase[];
  starterTemplates: IStarterTemplates;
  tags: string[];
  xp: number;
  hiddenTestCases: IHiddenTestCase[];
  referenceSolution?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmission {
  _id: string;
  userId: string;
  username: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  runtime?: number;
  memory?: number;
  errorDetails?: string;
  testsPassed: number;
  totalTests: number;
  awardedXp: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DuelPlayerStatus = "CODING" | "SUBMITTED" | "SOLVED";

export interface IDuelPlayer {
  userId?: string;
  username: string;
  displayName: string;
  image?: string;
  status: DuelPlayerStatus;
  code: string;
  submittedAt?: Date;
  testsPassed: number;
  totalTests: number;
  runtimeMs?: number;
}

export type DuelRoomStatus = "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";

export interface IDuelReadability {
  score: number;
  reason: string;
}

export interface IDuelFeedback {
  mistakes: string[];
  improvements: string[];
  betterApproach: string;
}

export interface IDuelPlayerScore {
  name: string;
  testsPassed: number;
  totalTests: number;
  runtimeMs: number;
  readability: IDuelReadability;
  feedback: IDuelFeedback;
}

export interface IDuelJudgeResult {
  winner: string | null;
  verdict: string;
  player1: IDuelPlayerScore;
  player2: IDuelPlayerScore;
  judgedAt: number;
}

export interface IDuelRoom {
  _id: string;
  roomCode: string;
  problemId: string;
  problemTitle?: string;
  status: DuelRoomStatus;
  endsAt?: Date;
  player1: IDuelPlayer;
  player2?: IDuelPlayer;
  judgeResult?: IDuelJudgeResult;
  winner?: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailOtp {
  _id: string;
  email: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

export * from "./learning";

