import { ObjectId } from 'mongodb';

export const ADMIN_EMAIL = 'nam4sh@gmail.com';

export interface UserDoc {
  _id?: ObjectId;
  userId?: string;
  email: string;
  name?: string;
  image?: string;
  role?: 'user' | 'admin';
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  selectedLanguages?: string[];
  xp?: number;
  level?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseDoc {
  _id?: ObjectId;
  courseId: string; // e.g. "course_python"
  slug: string;     // e.g. "python"
  title: string;    // e.g. "Python Development"
  language: string; // e.g. "Python"
  description: string;
  icon?: string;
  color?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  ordering: number;
  published: boolean;
  moduleIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ModuleDoc {
  _id?: ObjectId;
  moduleId: string; // e.g. "mod_py_fundamentals"
  courseId: string; // references CourseDoc.courseId
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  ordering: number;
  published: boolean;
  lessonIds?: string[];
  quizId?: string; // Module quiz unlocked after all module lessons are completed
  xpReward?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonDoc {
  _id?: ObjectId;
  lessonId: string; // e.g. "les_py_variables"
  moduleId: string; // references ModuleDoc.moduleId
  courseId: string; // references CourseDoc.courseId
  slug: string;
  title: string;
  content: string;  // Markdown content
  concepts: string[];
  ordering: number;
  published: boolean;
  starterCode?: string;
  questionIds?: string[];
  xpReward?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type QuestionType =
  | 'mcq'
  | 'fill_blank'
  | 'output_prediction'
  | 'debugging'
  | 'drag_drop'
  | 'coding_exercise';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  name?: string;
}

export interface QuestionDoc {
  _id?: ObjectId;
  questionId: string;
  courseId: string;
  moduleId: string;
  lessonId?: string;
  quizId?: string; // If question belongs to a quiz
  questionType: QuestionType;
  questionText: string;
  options?: string[]; // For MCQ
  correctAnswer: any;  // Stored in MongoDB, NEVER sent to client before submission!
  explanation: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  ordering: number;
  published: boolean;
  // Specific payloads
  template?: string; // For fill_blank e.g. "score ___ 42"
  blanks?: string[]; // For fill_blank
  blocks?: string[]; // For drag_drop
  correctOrder?: number[]; // For drag_drop
  buggyCode?: string; // For debugging
  codeSnippet?: string; // For output_prediction
  starterCode?: string; // For coding_exercise
  testCases?: TestCase[]; // For coding_exercise
  xpReward?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizDoc {
  _id?: ObjectId;
  quizId: string;
  moduleId?: string;
  courseId: string;
  title: string;
  description?: string;
  quizType: 'module_quiz' | 'course_final';
  questionIds: string[];
  passPercentage: number;
  xpReward: number;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizAttemptDoc {
  _id?: ObjectId;
  userId: string;
  userEmail: string;
  quizId: string;
  moduleId?: string;
  courseId?: string;
  scorePercentage: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  userAnswers: Record<string, any>;
  detailedResults: Array<{
    questionId: string;
    questionText: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    explanation: string;
  }>;
  createdAt: Date;
}

export interface UserProgressDoc {
  _id?: ObjectId;
  userId: string;
  userEmail: string;
  currentCourse?: string;
  currentModule?: string;
  currentLesson?: string;
  completedLessons: string[];   // Array of lessonId
  completedExercises: string[]; // Array of questionId / exerciseId
  completedModules: string[];   // Array of moduleId
  unlockedModules: string[];    // Array of moduleId
  passedQuizzes: string[];      // Array of quizId
  completedCourses: string[];   // Array of courseId
  updatedAt: Date;
}

export interface XPTransactionDoc {
  _id?: ObjectId;
  userId: string;
  amount: number;
  sourceType: string;
  sourceId: string;
  idempotencyKey: string; // "{userId}:{sourceType}:{sourceId}" prevents duplicate XP farming
  description: string;
  createdAt: Date;
}

export interface DailyMissionDoc {
  _id?: ObjectId;
  dateKey: string; // "YYYY-MM-DD"
  title: string;
  description: string;
  missionType: 'complete_lessons' | 'pass_quiz' | 'solve_practice' | 'run_code' | 'earn_xp';
  targetCount: number;
  xpReward: number;
  icon: string;
}

export interface UserMissionDoc {
  _id?: ObjectId;
  userId: string;
  missionId: string;
  dateKey: string;
  currentCount: number;
  isCompleted: boolean;
  claimedReward: boolean;
  completedAt?: Date;
  updatedAt: Date;
}

export interface AchievementDoc {
  _id?: ObjectId;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  criteriaType: string;
  criteriaThreshold: number;
}

export interface UserAchievementDoc {
  _id?: ObjectId;
  userId: string;
  achievementCode: string;
  unlockedAt: Date;
}

export interface CertificateDoc {
  _id?: ObjectId;
  certificateId: string; // "CF-PYTHON-0001-XXXX"
  userId: string;
  userEmail: string;
  recipientName: string;
  courseId: string;
  language: string;
  title: string;
  scorePercentage: number;
  verificationHash: string;
  issuedAt: Date;
}

export interface ProjectDoc {
  _id?: ObjectId;
  projectId: string;
  userId: string;
  userEmail: string;
  ownerName: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  files?: Record<string, string>;
  isPublic: boolean;
  viewsCount?: number;
  likesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DetectiveCaseDoc {
  _id?: ObjectId;
  caseId: string;
  caseNumber: string;
  title: string;
  summary: string;
  briefing: string;
  difficulty: 'Beginner' | 'Medium' | 'Expert';
  xpReward: number;
  evidenceFiles: Array<{
    filename: string;
    fileType: string;
    content: string;
  }>;
  clues: Array<{
    clueId: string;
    title: string;
    hint: string;
  }>;
  tasks: Array<{
    taskId: string;
    prompt: string;
    taskType: string;
    expectedAnswer: string;
    points: number;
  }>;
  sandboxSqlSeed?: string;
}

export interface DetectiveProgressDoc {
  _id?: ObjectId;
  userId: string;
  caseId: string;
  completedTaskIds: string[];
  unlockedClueIds: string[];
  taskAnswers: Record<string, string>;
  isSolved: boolean;
  solvedAt?: Date;
  xpAwarded?: number;
  updatedAt: Date;
}

export interface ArchitectMissionDoc {
  _id?: ObjectId;
  missionId: string;
  title: string;
  slug: string;
  summary: string;
  architectureOverview: string;
  language: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  totalPhases: number;
  phases: Array<{
    phaseNumber: number;
    title: string;
    requirements: string;
    starterCode: string;
    testSuiteCode: string;
    hints: string[];
  }>;
}

export interface ArchitectProgressDoc {
  _id?: ObjectId;
  userId: string;
  missionId: string;
  currentPhase: number;
  completedPhases: number[];
  phaseCodes: Record<string, string>;
  phaseTestResults: Record<string, any>;
  isCompleted: boolean;
  completedAt?: Date;
  xpAwarded?: number;
  updatedAt: Date;
}

export interface PracticeProblemDoc {
  _id?: ObjectId;
  problemId: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  category: string;
  tags: string[];
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  starterCode: Record<string, string>;
  testCases: TestCase[];
  xpReward: number;
}

export interface PracticeSubmissionDoc {
  _id?: ObjectId;
  submissionId: string;
  userId: string;
  problemId: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error';
  passedTestsCount: number;
  totalTestsCount: number;
  runtimeMs: number;
  testResults: Array<{
    name: string;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
  }>;
  xpAwarded: number;
  createdAt: Date;
}
