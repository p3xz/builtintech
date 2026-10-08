import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserLearning } from "@/models/UserLearning";
import { User } from "@/models/User";
import { getCourseById } from "@/data/courses";
import { issueCertificateForCourse } from "@/services/certificateService";
import mongoose from "mongoose";

async function findUserSafe(userId: string, email?: string | null) {
  const orList: any[] = [{ providerAccountId: userId }];
  if (mongoose.Types.ObjectId.isValid(userId)) {
    orList.push({ _id: new mongoose.Types.ObjectId(userId) });
  }
  if (email) {
    orList.push({ email });
  }
  return await User.findOne({ $or: orList });
}

async function updateUserXp(userId: string, email: string | null | undefined, xpAmount: number) {
  const orList: any[] = [{ providerAccountId: userId }];
  if (mongoose.Types.ObjectId.isValid(userId)) {
    orList.push({ _id: new mongoose.Types.ObjectId(userId) });
  }
  if (email) {
    orList.push({ email });
  }
  return await User.findOneAndUpdate({ $or: orList }, { $inc: { xp: xpAmount } }, { new: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const defaultProgress = {
    userId: session.user.id,
    username: session.user.username || "user",
    preferredLanguage: "python",
    experienceLevel: "Beginner",
    enrolledCourseIds: [],
    completedLessonIds: [],
    completedModuleIds: [],
    passedQuizIds: [],
    solvedCases: [],
    architectCompletedPhases: {},
    dailyMissionCurrent: 0,
    dailyMissionCompleted: false,
  };

  try {
    await connectToDatabase();

    let learning = await UserLearning.findOne({ userId: session.user.id });

    if (!learning) {
      try {
        learning = await UserLearning.create({
          userId: session.user.id,
          username: session.user.username || "user",
          enrolledCourseIds: [],
          completedLessonIds: [],
          completedModuleIds: [],
          passedQuizIds: [],
          solvedCases: [],
          architectCompletedPhases: {},
          dailyMissionCurrent: 0,
          dailyMissionCompleted: false,
        });
      } catch (createErr) {
        console.error("Failed to create UserLearning, using default:", createErr);
        return NextResponse.json({ success: true, progress: defaultProgress });
      }
    }

    const dbUser = await findUserSafe(session.user.id, session.user.email);

    return NextResponse.json({
      success: true,
      progress: {
        userId: session.user.id,
        username: session.user.username,
        preferredLanguage: learning.preferredLanguage,
        experienceLevel: learning.experienceLevel,
        enrolledCourseIds: learning.enrolledCourseIds || [],
        completedLessonIds: learning.completedLessonIds || [],
        completedModuleIds: learning.completedModuleIds || [],
        passedQuizIds: learning.passedQuizIds || [],
        currentCourseId: learning.currentCourseId,
        currentModuleId: learning.currentModuleId,
        currentLessonId: learning.currentLessonId,
        solvedCases: learning.solvedCases || [],
        architectCompletedPhases: learning.architectCompletedPhases || {},
        dailyMissionCurrent: learning.dailyMissionCurrent || 0,
        dailyMissionCompleted: learning.dailyMissionCompleted || false,
        xp: dbUser?.xp || 0,
        currentStreak: dbUser?.currentStreak || 0,
        longestStreak: dbUser?.longestStreak || 0,
      },
    });
    } catch (error) {
    console.error("Error retrieving user progress:", error);
    return NextResponse.json({ success: true, progress: defaultProgress });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, courseId, moduleId, lessonId, quizId, answers, preferredLanguage, experienceLevel, caseId, missionId, phaseNumber } = body;

    await connectToDatabase();

    let learning = await UserLearning.findOne({ userId: session.user.id });
    if (!learning) {
      learning = await UserLearning.create({
        userId: session.user.id,
        username: session.user.username || "user",
        enrolledCourseIds: [],
        completedLessonIds: [],
        completedModuleIds: [],
        passedQuizIds: [],
        solvedCases: [],
        architectCompletedPhases: {},
      });
    }

    // 1. Save Onboarding preferences
    if (action === "save-onboarding") {
      learning.preferredLanguage = preferredLanguage || "python";
      learning.experienceLevel = experienceLevel || "Beginner";
      learning.currentCourseId = courseId;
      learning.currentModuleId = moduleId;
      learning.currentLessonId = lessonId;

      if (courseId && !learning.enrolledCourseIds.includes(courseId)) {
        learning.enrolledCourseIds.push(courseId);
      }

      await learning.save();
      return NextResponse.json({ success: true, progress: learning });
    }

    // 2. Complete Lesson
    if (action === "complete-lesson") {
      const course = getCourseById(courseId);
      const targetModule = course?.modules.find((m) => m.moduleId === moduleId);

      if (!learning.completedLessonIds.includes(lessonId)) {
        learning.completedLessonIds.push(lessonId);
        // Increment real XP
        await updateUserXp(session.user.id, session.user.email, 25);
      }

      learning.currentCourseId = courseId;
      learning.currentModuleId = moduleId;
      learning.currentLessonId = lessonId;

      if (courseId && !learning.enrolledCourseIds.includes(courseId)) {
        learning.enrolledCourseIds.push(courseId);
      }

      // Check if all lessons in module are complete
      const allDone = Boolean(
        targetModule &&
          targetModule.lessons.length > 0 &&
          targetModule.lessons.every((l) =>
            learning.completedLessonIds.includes(l.lessonId)
          )
      );

      await learning.save();
      const updatedUser = await findUserSafe(session.user.id, session.user.email);

      return NextResponse.json({
        success: true,
        xpAwarded: 25,
        totalXp: updatedUser?.xp || 0,
        moduleCompleted: allDone,
        progress: learning,
      });
    }

    // 3. Submit Module Checkpoint Quiz
    if (action === "submit-quiz") {
      const course = getCourseById(courseId);
      const targetModule = course?.modules.find((m) => m.moduleId === moduleId);
      const quiz = targetModule?.quiz;

      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      let correctCount = 0;
      quiz.questions.forEach((q) => {
        if (answers && answers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });

      const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = scorePercent >= quiz.passingScorePercent;

      let nextModuleId: string | undefined = undefined;

      if (passed) {
        if (!learning.passedQuizIds.includes(quiz.quizId)) {
          learning.passedQuizIds.push(quiz.quizId);
          await updateUserXp(session.user.id, session.user.email, quiz.xpReward);
        }
        if (!learning.completedModuleIds.includes(moduleId)) {
          learning.completedModuleIds.push(moduleId);
        }

        const currentIdx = course?.modules.findIndex((m) => m.moduleId === moduleId) ?? -1;
        if (course && currentIdx !== -1 && currentIdx + 1 < course.modules.length) {
          nextModuleId = course.modules[currentIdx + 1].moduleId;
          learning.currentModuleId = nextModuleId;
          learning.currentLessonId = course.modules[currentIdx + 1].lessons[0]?.lessonId;
        }

        await learning.save();
      }

      const updatedUser = await findUserSafe(session.user.id, session.user.email);

      return NextResponse.json({
        success: true,
        passed,
        scorePercent,
        correctCount,
        totalQuestions: quiz.questions.length,
        xpAwarded: passed ? quiz.xpReward : 0,
        totalXp: updatedUser?.xp || 0,
        nextModuleId,
        progress: learning,
      });
    }

    // 4. Solve Detective Case
    if (action === "solve-case") {
      if (caseId && !learning.solvedCases.includes(caseId)) {
        learning.solvedCases.push(caseId);
        await updateUserXp(session.user.id, session.user.email, 150);
        await learning.save();
      }
      return NextResponse.json({ success: true, progress: learning });
    }

    // 5. Complete Architect Phase
    if (action === "complete-architect-phase") {
      if (missionId && typeof phaseNumber === "number") {
        const phasesMap = learning.architectCompletedPhases || {};
        const missionPhases = phasesMap[missionId] || [];
        if (!missionPhases.includes(phaseNumber)) {
          missionPhases.push(phaseNumber);
          phasesMap[missionId] = missionPhases;
          learning.architectCompletedPhases = phasesMap;
          learning.markModified("architectCompletedPhases");
          await updateUserXp(session.user.id, session.user.email, 100);
          await learning.save();
        }
      }
      return NextResponse.json({ success: true, progress: learning });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user progress:", error);
    return NextResponse.json({ error: "Failed to update user progress" }, { status: 500 });
  }
}
