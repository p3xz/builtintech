export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type SupportedLanguage =
  | "python"
  | "html"
  | "css"
  | "javascript"
  | "sql"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "php"
  | "typescript"
  | "swift"
  | "ruby";

export type PracticeExerciseType =
  | "write-code"
  | "multiple-choice"
  | "fill-in-blank"
  | "arrange-code"
  | "drag-drop"
  | "debugging"
  | "output-prediction";

export interface LessonTryIt {
  instructions: string;
  type?: "code" | "fill-in-blank" | "multiple-choice" | "debugging" | "output-prediction";
  starterCode?: string;
  solutionCode?: string;
  expectedOutput?: string;
  hint?: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
}

export interface LessonExample {
  title?: string;
  code: string;
  language: string;
  output?: string;
  explanation?: string;
}

export interface ILesson {
  id: string;
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes: number;
  concept: string; // Markdown or rich structured text
  conceptPoints?: string[];
  example: LessonExample;
  tryIt: LessonTryIt;
  isCompleted?: boolean;
}

export interface IPracticeActivity {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  type: PracticeExerciseType;
  prompt: string;
  instructions: string;
  starterCode?: string;
  solutionCode?: string;
  options?: string[];
  correctAnswer?: string | number | string[];
  explanation: string;
  conceptHint?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
  blocks?: string[]; // for arrange-code or drag-drop
  xp: number;
}

export interface IQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptHint?: string;
}

export interface IModuleQuiz {
  id: string;
  quizId: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  passingScorePercent: number; // e.g. 70
  xpReward: number;
  questions: IQuizQuestion[];
}

export interface ICourseModule {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  lessons: ILesson[];
  practiceActivities: IPracticeActivity[];
  quiz: IModuleQuiz;
  isCompleted?: boolean;
  isLocked?: boolean;
  isCurrent?: boolean;
}

export interface ICourse {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  language: SupportedLanguage;
  level: CourseLevel;
  tagline: string;
  description: string;
  icon: string;
  bannerGradient: string;
  estimatedHours: number;
  totalXp: number;
  modules: ICourseModule[];
  prerequisites?: string[];
  whatYouWillLearn: string[];
  isEnrolled?: boolean;
  progressPercent?: number;
}

export interface IUserLearningProgress {
  userId: string;
  currentCourseId?: string;
  currentModuleId?: string;
  currentLessonId?: string;
  enrolledCourseIds: string[];
  completedLessonIds: string[];
  completedModuleIds: string[];
  passedQuizIds: string[];
  quizScores: Record<string, { score: number; passed: boolean; completedAt: string }>;
  experienceLevel?: CourseLevel;
  preferredLanguage?: SupportedLanguage;
  updatedAt: string;
}

export interface IExecutionStep {
  stepNumber: number;
  line: number;
  statement: string;
  variables: Record<string, string | number | boolean | null | Array<unknown>>;
  stdout: string;
  explanation?: string;
}

export interface IExecutionTrace {
  success: boolean;
  totalSteps: number;
  finalOutput: string;
  steps: IExecutionStep[];
  runtimeMs: number;
  error?: string;
}

export interface IProject {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  title: string;
  description: string;
  language: SupportedLanguage;
  code: string;
  visibility: "public" | "private";
  tags: string[];
  likesCount: number;
  forksCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IEvidenceFile {
  name: string;
  type: "log" | "sql" | "json" | "env" | "code";
  content: string;
  clues?: string[];
}

export interface IDetectiveTask {
  id: string;
  prompt: string;
  hint: string;
  expectedKeywords?: string[];
  expectedAnswer?: string;
  type: "query" | "text" | "choice";
  options?: string[];
  correctOptionIndex?: number;
  xp: number;
}

export interface IDetectiveCase {
  id: string;
  caseNumber: string; // e.g. "CASE #047"
  title: string;
  subtitle: string;
  domain: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  scenario: string;
  evidenceFiles: IEvidenceFile[];
  tasks: IDetectiveTask[];
  solutionSummary: string;
  xpReward: number;
  isSolved?: boolean;
}

export interface IArchitectPhase {
  phaseNumber: number;
  title: string;
  description: string;
  requirements: string[];
  starterCode: string;
  solutionTemplate?: string;
  testCases: Array<{ name: string; input: string; expectedOutput: string }>;
  hint: string;
  xp: number;
  isCompleted?: boolean;
}

export interface IArchitectMission {
  id: string;
  missionNumber: string; // e.g. "MISSION #012"
  title: string;
  subtitle: string;
  domain: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  language: SupportedLanguage;
  blueprint: string;
  phases: IArchitectPhase[];
  totalXp: number;
  isCompleted?: boolean;
}

export interface IDailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  type: "lessons" | "exercises" | "quiz" | "duels" | "practice";
  expiresAt: string;
}

export interface IAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "learning" | "quiz" | "special" | "duel" | "community";
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent?: number;
}

export interface ICertificate {
  id: string;
  certificateId: string;
  userId: string;
  username: string;
  displayName: string;
  courseId: string;
  courseTitle: string;
  language: SupportedLanguage;
  issuedAt: string;
  grade: "Passed" | "Distinction" | "Mastery";
  verificationHash: string;
}
