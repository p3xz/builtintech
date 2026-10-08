import { getDatabase } from './mongodb';
import {
  UserDoc,
  CourseDoc,
  ModuleDoc,
  LessonDoc,
  QuestionDoc,
  QuizDoc,
  QuizAttemptDoc,
  UserProgressDoc,
  XPTransactionDoc,
  DailyMissionDoc,
  UserMissionDoc,
  AchievementDoc,
  UserAchievementDoc,
  CertificateDoc,
  DetectiveCaseDoc,
  DetectiveProgressDoc,
  ArchitectMissionDoc,
  ArchitectProgressDoc,
  PracticeProblemDoc,
  PracticeSubmissionDoc,
} from './models';
import { executeCodeLocally, runCodeTestsLocally, generateExecutionVisualization } from './engine';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getLevelProgress(xp: number) {
  const level = calculateLevel(xp);
  const currentLevelMinXp = (level - 1) ** 2 * 100;
  const nextLevelMinXp = level ** 2 * 100;
  const needed = nextLevelMinXp - currentLevelMinXp;
  const current = xp - currentLevelMinXp;
  const percentage = needed > 0 ? Math.min(100, Math.max(0, (current / needed) * 100)) : 100;

  return {
    level,
    xp,
    xpForCurrentLevel: currentLevelMinXp,
    xpForNextLevel: nextLevelMinXp,
    levelProgressPercentage: Math.round(percentage * 100) / 100,
  };
}

/**
 * Server-authoritative XP awarding with anti-abuse idempotency keys in MongoDB.
 */
export async function awardXP(
  userId: string,
  amount: number,
  sourceType: string,
  sourceId: string,
  description: string,
  allowRepeat: boolean = false,
  repeatAmount: number = 5
): Promise<{ xpAwarded: number; newTotalXp: number; levelUp: boolean }> {
  const db = await getDatabase();
  const xpCollection = db.collection<XPTransactionDoc>('xp_transactions');
  const usersCollection = db.collection<UserDoc>('users');

  const idempotencyKey = `${userId}:${sourceType}:${sourceId}`;
  const existing = await xpCollection.findOne({ idempotencyKey });

  let awarded = 0;
  if (existing) {
    if (allowRepeat && repeatAmount > 0) {
      awarded = repeatAmount;
      await xpCollection.insertOne({
        userId,
        amount: awarded,
        sourceType: `${sourceType}_repeat`,
        sourceId,
        idempotencyKey: `${idempotencyKey}:repeat:${Date.now()}`,
        description: `${description} (Practice Repetition)`,
        createdAt: new Date(),
      });
    } else {
      const user = await usersCollection.findOne({
        $or: [{ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : undefined }, { email: userId }],
      });
      return { xpAwarded: 0, newTotalXp: user?.xp || 0, levelUp: false };
    }
  } else {
    awarded = amount;
    await xpCollection.insertOne({
      userId,
      amount: awarded,
      sourceType,
      sourceId,
      idempotencyKey,
      description,
      createdAt: new Date(),
    });
  }

  // Update user XP & Level
  const user = await usersCollection.findOne({
    $or: [{ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : undefined }, { email: userId }],
  });

  const oldLevel = user?.level || 1;
  const newXp = (user?.xp || 0) + awarded;
  const newLevel = calculateLevel(newXp);
  const levelUp = newLevel > oldLevel;

  await usersCollection.updateOne(
    { _id: user?._id },
    { $set: { xp: newXp, level: newLevel, updatedAt: new Date() } }
  );

  // Progress daily missions for earning XP
  await recordMissionProgress(userId, 'earn_xp', awarded);

  return { xpAwarded: awarded, newTotalXp: newXp, levelUp };
}

/**
 * Server-authoritative streak update based on qualifying daily activity.
 */
export async function updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const db = await getDatabase();
  const usersCollection = db.collection<UserDoc>('users');
  const user = await usersCollection.findOne({
    $or: [{ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : undefined }, { email: userId }],
  });

  if (!user) return { currentStreak: 0, longestStreak: 0 };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const lastDateStr = user.lastActivityDate ? user.lastActivityDate.toISOString().split('T')[0] : null;

  let currentStreak = user.currentStreak || 0;
  let longestStreak = user.longestStreak || 0;

  if (!lastDateStr) {
    currentStreak = 1;
  } else if (lastDateStr === todayStr) {
    // Already active today
  } else {
    const lastDate = new Date(lastDateStr);
    const diffDays = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  await usersCollection.updateOne(
    { _id: user._id },
    { $set: { currentStreak, longestStreak, lastActivityDate: now, updatedAt: now } }
  );

  return { currentStreak, longestStreak };
}

/**
 * Retrieves or initializes user progress document.
 */
export async function getUserProgress(userId: string, userEmail: string): Promise<UserProgressDoc> {
  const db = await getDatabase();
  const progressCollection = db.collection<UserProgressDoc>('user_progress');

  let prog = await progressCollection.findOne({ userId });
  if (!prog) {
    const newProg: UserProgressDoc = {
      userId,
      userEmail,
      completedLessons: [],
      completedExercises: [],
      completedModules: [],
      unlockedModules: [],
      passedQuizzes: [],
      completedCourses: [],
      updatedAt: new Date(),
    };
    const result = await progressCollection.insertOne(newProg);
    prog = { ...newProg, _id: result.insertedId };
  }
  return prog;
}

/**
 * Progression Gate: Verifies whether all lessons in a module are completed
 * before unlocking the module quiz.
 */
export async function checkModuleQuizUnlocked(
  userId: string,
  userEmail: string,
  moduleId: string
): Promise<{ isUnlocked: boolean; totalLessons: number; completedLessons: number; missingLessonIds: string[] }> {
  const db = await getDatabase();
  const modulesCollection = db.collection<ModuleDoc>('modules');
  const lessonsCollection = db.collection<LessonDoc>('lessons');

  const moduleDoc = await modulesCollection.findOne({ moduleId, published: true });
  if (!moduleDoc) {
    return { isUnlocked: false, totalLessons: 0, completedLessons: 0, missingLessonIds: [] };
  }

  const moduleLessons = await lessonsCollection.find({ moduleId, published: true }).toArray();
  const totalLessons = moduleLessons.length;
  const progress = await getUserProgress(userId, userEmail);

  const completedSet = new Set(progress.completedLessons || []);
  const missingLessonIds = moduleLessons
    .map((l) => l.lessonId)
    .filter((id) => !completedSet.has(id));

  const completedLessons = totalLessons - missingLessonIds.length;
  const isUnlocked = missingLessonIds.length === 0 && totalLessons > 0;

  return {
    isUnlocked,
    totalLessons,
    completedLessons,
    missingLessonIds,
  };
}

/**
 * Complete a lesson authoritatively.
 */
export async function completeLesson(
  userId: string,
  userEmail: string,
  lessonId: string
) {
  const db = await getDatabase();
  const lessonsCollection = db.collection<LessonDoc>('lessons');
  const progressCollection = db.collection<UserProgressDoc>('user_progress');

  const lesson = await lessonsCollection.findOne({ lessonId, published: true });
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  const progress = await getUserProgress(userId, userEmail);
  const completedLessons = new Set(progress.completedLessons || []);
  const isFirstTime = !completedLessons.has(lessonId);

  completedLessons.add(lessonId);

  await progressCollection.updateOne(
    { userId },
    {
      $set: {
        completedLessons: Array.from(completedLessons),
        currentCourse: lesson.courseId,
        currentModule: lesson.moduleId,
        currentLesson: lesson.lessonId,
        updatedAt: new Date(),
      },
    }
  );

  let xpResult = { xpAwarded: 0, newTotalXp: 0, levelUp: false };
  if (isFirstTime) {
    xpResult = await awardXP(
      userId,
      lesson.xpReward || 25,
      'lesson',
      lessonId,
      `Completed Lesson: ${lesson.title}`
    );
  }

  await updateStreak(userId);
  await recordMissionProgress(userId, 'complete_lessons', 1);
  await checkAndUnlockAchievements(userId);

  return {
    lessonId,
    completed: true,
    isFirstTime,
    xpAwarded: xpResult.xpAwarded,
  };
}

/**
 * Evaluates an interactive question submission without leaking correct answers beforehand.
 */
export async function evaluateQuestionSubmission(
  userId: string,
  userEmail: string,
  questionId: string,
  answer: any,
  code?: string
) {
  const db = await getDatabase();
  const questionsCollection = db.collection<QuestionDoc>('questions');
  const progressCollection = db.collection<UserProgressDoc>('user_progress');

  const q = await questionsCollection.findOne({ questionId, published: true });
  if (!q) {
    throw new Error('Question not found');
  }

  let isCorrect = false;
  let testResults: any[] = [];
  let stdout = '';
  let stderr = '';

  const qType = q.questionType;

  if (qType === 'mcq') {
    isCorrect = String(answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
  } else if (qType === 'fill_blank') {
    if (Array.isArray(answer)) {
      const exp = q.blanks || [q.correctAnswer];
      isCorrect =
        answer.length === exp.length &&
        answer.every((v, i) => String(v).trim().toLowerCase() === String(exp[i]).trim().toLowerCase());
    } else {
      isCorrect = String(answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    }
  } else if (qType === 'output_prediction') {
    isCorrect = String(answer).trim() === String(q.correctAnswer).trim();
  } else if (qType === 'drag_drop') {
    const correctOrder = q.correctOrder || [];
    if (Array.isArray(answer)) {
      isCorrect = JSON.stringify(answer) === JSON.stringify(correctOrder);
    }
  } else if (qType === 'debugging' || qType === 'coding_exercise') {
    const submittedCode = code || String(answer);
    const testCases = q.testCases || [];
    if (testCases.length > 0) {
      const res = await runCodeTestsLocally('python', submittedCode, testCases);
      testResults = res.results;
      isCorrect = res.allPassed;
      stdout = res.results.map((r: any) => `${r.name}: ${r.passed ? 'PASS' : 'FAIL'}`).join('\n');
    } else {
      const res = await executeCodeLocally('python', submittedCode);
      stdout = res.stdout;
      stderr = res.stderr;
      isCorrect = res.exitCode === 0 && !res.error;
    }
  }

  let xpResult = { xpAwarded: 0, newTotalXp: 0, levelUp: false };
  if (isCorrect) {
    const progress = await getUserProgress(userId, userEmail);
    const exercises = new Set(progress.completedExercises || []);
    exercises.add(questionId);

    await progressCollection.updateOne(
      { userId },
      { $set: { completedExercises: Array.from(exercises), updatedAt: new Date() } }
    );

    xpResult = await awardXP(
      userId,
      q.xpReward || 30,
      'exercise',
      questionId,
      `Solved Exercise: ${q.questionText.slice(0, 30)}...`,
      true,
      5
    );

    await updateStreak(userId);
    await checkAndUnlockAchievements(userId);
  }

  return {
    questionId,
    isCorrect,
    userAnswer: answer,
    explanation: q.explanation,
    testResults,
    stdout,
    stderr,
    xpAwarded: xpResult.xpAwarded,
  };
}

/**
 * Evaluates Quiz Submission Server-Authoritatively.
 * Gates progression: Must complete module lessons first!
 */
export async function evaluateQuizSubmission(
  userId: string,
  userEmail: string,
  quizId: string,
  answers: Record<string, any>
) {
  const db = await getDatabase();
  const quizzesCollection = db.collection<QuizDoc>('quizzes');
  const questionsCollection = db.collection<QuestionDoc>('questions');
  const attemptsCollection = db.collection<QuizAttemptDoc>('quiz_attempts');
  const progressCollection = db.collection<UserProgressDoc>('user_progress');
  const modulesCollection = db.collection<ModuleDoc>('modules');
  const coursesCollection = db.collection<CourseDoc>('courses');
  const certsCollection = db.collection<CertificateDoc>('certificates');

  const quiz = await quizzesCollection.findOne({ quizId, published: true });
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // PROGRESSION GATE: Check if module is completed before allowing quiz submission
  if (quiz.moduleId) {
    const gateCheck = await checkModuleQuizUnlocked(userId, userEmail, quiz.moduleId);
    if (!gateCheck.isUnlocked) {
      throw new Error(
        `Progression Gate: You must complete all ${gateCheck.totalLessons} lessons in this module before attempting the quiz.`
      );
    }
  }

  const questions = await questionsCollection
    .find({ questionId: { $in: quiz.questionIds }, published: true })
    .toArray();

  let correctCount = 0;
  const detailedResults = [];

  for (const q of questions) {
    const userAns = answers[q.questionId];
    const isCorr = String(userAns || '').trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    if (isCorr) correctCount++;

    detailedResults.push({
      questionId: q.questionId,
      questionText: q.questionText,
      userAnswer: userAns,
      correctAnswer: q.correctAnswer,
      isCorrect: isCorr,
      explanation: q.explanation,
    });
  }

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;
  const passed = scorePercentage >= (quiz.passPercentage || 70);

  // Save attempt
  await attemptsCollection.insertOne({
    userId,
    userEmail,
    quizId,
    moduleId: quiz.moduleId,
    courseId: quiz.courseId,
    scorePercentage,
    passed,
    totalQuestions,
    correctCount,
    userAnswers: answers,
    detailedResults,
    createdAt: new Date(),
  });

  let xpAwarded = 0;
  let certificate = null;
  let unlockedNextModule = null;

  if (passed) {
    const xpRes = await awardXP(
      userId,
      quiz.xpReward || 100,
      'quiz',
      quizId,
      `Passed Quiz: ${quiz.title}`,
      true,
      10
    );
    xpAwarded = xpRes.xpAwarded;

    const progress = await getUserProgress(userId, userEmail);
    const passedQuizzes = new Set(progress.passedQuizzes || []);
    passedQuizzes.add(quizId);

    const completedModules = new Set(progress.completedModules || []);
    if (quiz.moduleId) {
      completedModules.add(quiz.moduleId);
    }

    // Unlock next module
    if (quiz.moduleId) {
      const currentMod = await modulesCollection.findOne({ moduleId: quiz.moduleId });
      if (currentMod) {
        const nextMod = await modulesCollection.findOne({
          courseId: currentMod.courseId,
          ordering: currentMod.ordering + 1,
          published: true,
        });
        if (nextMod) {
          const unlocked = new Set(progress.unlockedModules || []);
          unlocked.add(nextMod.moduleId);
          unlockedNextModule = nextMod.moduleId;
        }
      }
    }

    // Check course completion if final quiz
    let completedCourses = progress.completedCourses || [];
    if (quiz.quizType === 'course_final' && quiz.courseId) {
      const cSet = new Set(completedCourses);
      cSet.add(quiz.courseId);
      completedCourses = Array.from(cSet);

      const course = await coursesCollection.findOne({ courseId: quiz.courseId });
      if (course) {
        // Generate Certificate
        const certId = `CF-${(course.language || 'TECH').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const newCert: CertificateDoc = {
          certificateId: certId,
          userId,
          userEmail,
          recipientName: userEmail.split('@')[0],
          courseId: course.courseId,
          language: course.language,
          title: `Certificate of Mastery in ${course.title}`,
          scorePercentage,
          verificationHash: crypto.randomBytes(16).toString('hex'),
          issuedAt: new Date(),
        };
        await certsCollection.insertOne(newCert);
        certificate = newCert;

        await awardXP(userId, 300, 'course_completion', course.courseId, `Graduated: ${course.title}`);
      }
    }

    await progressCollection.updateOne(
      { userId },
      {
        $set: {
          passedQuizzes: Array.from(passedQuizzes),
          completedModules: Array.from(completedModules),
          completedCourses,
          updatedAt: new Date(),
        },
      }
    );

    await updateStreak(userId);
    await recordMissionProgress(userId, 'pass_quiz', 1);
    await checkAndUnlockAchievements(userId);
  }

  return {
    quizId,
    title: quiz.title,
    passed,
    scorePercentage,
    passPercentage: quiz.passPercentage,
    totalQuestions,
    correctCount,
    detailedResults,
    xpAwarded,
    unlockedNextModule,
    certificate,
  };
}

/**
 * Dynamic Daily Missions & Progress Recording
 */
export async function getDailyMissions(userId: string) {
  const db = await getDatabase();
  const missionsCollection = db.collection<DailyMissionDoc>('daily_missions');
  const userMissionsCollection = db.collection<UserMissionDoc>('user_missions');

  const todayStr = new Date().toISOString().split('T')[0];

  let missions = await missionsCollection.find({ dateKey: todayStr }).toArray();
  if (missions.length === 0) {
    // Seed 3 daily missions
    const seeds: DailyMissionDoc[] = [
      {
        dateKey: todayStr,
        title: 'Artisan: Complete 2 Lessons',
        description: 'Finish 2 interactive curriculum lessons today.',
        missionType: 'complete_lessons',
        targetCount: 2,
        xpReward: 60,
        icon: 'book-open',
      },
      {
        dateKey: todayStr,
        title: 'Quiz Ace: Pass 1 Module Quiz',
        description: 'Demonstrate module mastery by passing a quiz.',
        missionType: 'pass_quiz',
        targetCount: 1,
        xpReward: 75,
        icon: 'award',
      },
      {
        dateKey: todayStr,
        title: 'XP Surge: Earn 100 XP',
        description: 'Gain 100 XP across platform activities.',
        missionType: 'earn_xp',
        targetCount: 100,
        xpReward: 50,
        icon: 'zap',
      },
    ];
    await missionsCollection.insertMany(seeds);
    missions = await missionsCollection.find({ dateKey: todayStr }).toArray();
  }

  const userMissions = await userMissionsCollection.find({ userId, dateKey: todayStr }).toArray();
  const userMap = new Map(userMissions.map((um) => [um.missionId, um]));

  return missions.map((m) => {
    const um = userMap.get(m._id?.toString() || '');
    return {
      missionId: m._id?.toString(),
      dateKey: m.dateKey,
      title: m.title,
      description: m.description,
      missionType: m.missionType,
      targetCount: m.targetCount,
      xpReward: m.xpReward,
      icon: m.icon,
      currentCount: um ? um.currentCount : 0,
      isCompleted: um ? um.isCompleted : false,
      claimedReward: um ? um.claimedReward : false,
    };
  });
}

export async function recordMissionProgress(userId: string, missionType: string, count: number) {
  const db = await getDatabase();
  const missionsCollection = db.collection<DailyMissionDoc>('daily_missions');
  const userMissionsCollection = db.collection<UserMissionDoc>('user_missions');

  const todayStr = new Date().toISOString().split('T')[0];
  const matching = await missionsCollection.find({ dateKey: todayStr, missionType: missionType as any }).toArray();

  for (const m of matching) {
    const mId = m._id?.toString() || '';
    let um = await userMissionsCollection.findOne({ userId, missionId: mId });
    if (!um) {
      const newUm: UserMissionDoc = {
        userId,
        missionId: mId,
        dateKey: todayStr,
        currentCount: 0,
        isCompleted: false,
        claimedReward: false,
        updatedAt: new Date(),
      };
      const insertRes = await userMissionsCollection.insertOne(newUm);
      um = { ...newUm, _id: insertRes.insertedId };
    }

    if (um && !um.isCompleted) {
      const newCount = (um.currentCount || 0) + count;
      const isCompleted = newCount >= m.targetCount;
      await userMissionsCollection.updateOne(
        { userId, missionId: mId },
        {
          $set: {
            currentCount: newCount,
            isCompleted,
            completedAt: isCompleted ? new Date() : undefined,
            updatedAt: new Date(),
          },
        }
      );
    }
  }
}

/**
 * Automatic Achievement Unlocks in MongoDB
 */
export async function checkAndUnlockAchievements(userId: string) {
  const db = await getDatabase();
  const achievementsCollection = db.collection<AchievementDoc>('achievements');
  const userAchCollection = db.collection<UserAchievementDoc>('user_achievements');
  const progressCollection = db.collection<UserProgressDoc>('user_progress');
  const usersCollection = db.collection<UserDoc>('users');

  const user = await usersCollection.findOne({
    $or: [{ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : undefined }, { email: userId }],
  });
  const progress = await progressCollection.findOne({ userId });

  const allAch = await achievementsCollection.find().toArray();
  const unlocked = await userAchCollection.find({ userId }).toArray();
  const unlockedCodes = new Set(unlocked.map((u) => u.achievementCode));

  const lessonsCount = progress?.completedLessons?.length || 0;
  const quizzesCount = progress?.passedQuizzes?.length || 0;
  const coursesCount = progress?.completedCourses?.length || 0;
  const streak = user?.currentStreak || 0;

  for (const ach of allAch) {
    if (unlockedCodes.has(ach.code)) continue;

    let qualifies = false;
    if (ach.criteriaType === 'first_program' && lessonsCount >= 1) qualifies = true;
    if (ach.criteriaType === 'first_quiz' && quizzesCount >= 1) qualifies = true;
    if (ach.criteriaType === 'streak_days' && streak >= ach.criteriaThreshold) qualifies = true;
    if (ach.criteriaType === 'first_course' && coursesCount >= 1) qualifies = true;
    if (ach.criteriaType === 'polyglot' && coursesCount >= ach.criteriaThreshold) qualifies = true;

    if (qualifies) {
      await userAchCollection.insertOne({
        userId,
        achievementCode: ach.code,
        unlockedAt: new Date(),
      });
      await awardXP(userId, ach.xpReward, 'achievement', ach.code, `Achievement: ${ach.title}`);
    }
  }
}
