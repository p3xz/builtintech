import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { UserLearning } from "@/models/UserLearning";
import { getCourseById } from "@/data/courses";
import { executeCodeOnlineCompilerSyncWithLang } from "@/lib/onlinecompiler";
import { calculateStreak } from "@/lib/streak";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseId,
      moduleId,
      lessonId,
      code,
      language: customLang,
      isCheck = true,
      customStdin = "",
    } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          status: "EXECUTION_ERROR",
          passed: false,
          errorTitle: "Missing Code",
          output: "Please write code in the editor before running.",
          message: "No code provided to execute.",
        },
        { status: 400 }
      );
    }

    const course = courseId ? getCourseById(courseId) : undefined;
    const currentModule = course?.modules.find((m) => m.moduleId === moduleId || m.id === moduleId);
    const lesson = currentModule?.lessons.find((l) => l.lessonId === lessonId || l.id === lessonId);

    // Determine compiler language
    const language = (customLang || lesson?.example?.language || course?.language || "python").toLowerCase().trim();

    // 1. Execute code using OnlineCompiler API
    const execResult = await executeCodeOnlineCompilerSyncWithLang(
      language,
      code,
      customStdin
    );

    // 2. Classify errors strictly
    if (execResult.compilationError) {
      return NextResponse.json({
        status: "COMPILE_ERROR",
        passed: false,
        errorTitle: "Compilation Error",
        output: execResult.stderr || execResult.output || "Compilation failed. Check syntax and types.",
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        time: execResult.time,
        message: "Compilation error. The program failed to build.",
      });
    }

    if (execResult.isTimeout) {
      return NextResponse.json({
        status: "TIME_LIMIT",
        passed: false,
        errorTitle: "Time Limit Exceeded",
        output: "Execution timed out (30s limit). Ensure your program does not contain infinite loops.",
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        time: execResult.time,
        message: "Time limit exceeded.",
      });
    }

    if (execResult.runtimeError) {
      return NextResponse.json({
        status: "RUNTIME_ERROR",
        passed: false,
        errorTitle: "Runtime Error",
        output: execResult.stderr || execResult.output || "Program crashed with non-zero exit code.",
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        time: execResult.time,
        message: "Runtime crash. Check memory access, index bounds, or unhandled exceptions.",
      });
    }

    // 3. Output comparison
    const normalize = (s: string) =>
      s
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+$/gm, "") // trim trailing space per line
        .trim();

    const actualNormalized = normalize(execResult.stdout);
    const rawExpected = lesson?.tryIt?.expectedOutput;
    const expectedNormalized = typeof rawExpected === "string" ? normalize(rawExpected) : "";

    let isPassed = false;
    let mismatchReason = "";

    if (expectedNormalized) {
      if (actualNormalized === expectedNormalized) {
        isPassed = true;
      } else {
        isPassed = false;
        mismatchReason = `Expected output:\n${expectedNormalized}\n\nActual output:\n${actualNormalized || "(empty output)"}`;
      }
    } else {
      // If no expected output configured (e.g. open sandbox), clean execution is passed
      isPassed = execResult.success && !execResult.runtimeError && !execResult.compilationError;
    }

    // If running only (not checking/submitting)
    if (!isCheck) {
      return NextResponse.json({
        status: isPassed ? "PASSED" : "WRONG_ANSWER",
        passed: isPassed,
        output: execResult.stdout || execResult.stderr || "(No output produced)",
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        time: execResult.time,
        expectedOutput: rawExpected,
        message: isPassed ? "Output matches expected test result." : mismatchReason,
      });
    }

    // If failed check
    if (!isPassed) {
      return NextResponse.json({
        status: "WRONG_ANSWER",
        passed: false,
        errorTitle: "Wrong Answer",
        output: execResult.stdout || "(No output produced)",
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        expectedOutput: rawExpected,
        time: execResult.time,
        hint: lesson?.tryIt?.hint,
        message: mismatchReason || "Output does not match the required challenge output.",
      });
    }

    // 4. PASSED -> Persist to MongoDB (Idempotent XP & streak)
    let xpAwarded = 0;
    let totalXp = 0;
    let currentStreak = 0;
    let moduleCompleted = false;

    try {
      const session = await auth();
      if (session?.user?.id) {
        await connectToDatabase();
        const userId = session.user.id;

        let learning = await UserLearning.findOne({ userId });
        if (!learning) {
          learning = await UserLearning.create({
            userId,
            username: session.user.username || "user",
            enrolledCourseIds: courseId ? [courseId] : [],
            completedLessonIds: [],
            completedModuleIds: [],
            passedQuizIds: [],
            solvedCases: [],
            architectCompletedPhases: {},
          });
        }

        const isFirstSolve = !learning.completedLessonIds.includes(lessonId);

        if (isFirstSolve) {
          learning.completedLessonIds.push(lessonId);
          xpAwarded = 25;
        }

        if (courseId && !learning.enrolledCourseIds.includes(courseId)) {
          learning.enrolledCourseIds.push(courseId);
        }
        if (courseId) learning.currentCourseId = courseId;
        if (moduleId) learning.currentModuleId = moduleId;
        if (lessonId) learning.currentLessonId = lessonId;

        // Check if all lessons in module are complete
        if (currentModule && currentModule.lessons.length > 0) {
          moduleCompleted = currentModule.lessons.every((l) =>
            learning?.completedLessonIds.includes(l.lessonId)
          );
        } else {
          moduleCompleted = true;
        }

        await learning.save();

        // Update User in MongoDB
        const dbUser = await User.findById(userId);
        if (dbUser) {
          if (isFirstSolve) {
            dbUser.xp = (dbUser.xp || 0) + 25;
          }
          const streakRes = calculateStreak(
            dbUser.currentStreak || 0,
            dbUser.longestStreak || 0,
            dbUser.lastActiveDate
          );
          dbUser.currentStreak = streakRes.currentStreak;
          dbUser.longestStreak = streakRes.longestStreak;
          dbUser.lastActiveDate = streakRes.lastActiveDate;
          await dbUser.save();

          totalXp = dbUser.xp || 0;
          currentStreak = dbUser.currentStreak || 0;
        }
      }
    } catch (dbErr) {
      console.error("[Validate API] Database update error:", dbErr);
    }

    return NextResponse.json({
      status: "PASSED",
      passed: true,
      stdout: execResult.stdout,
      stderr: execResult.stderr,
      output: execResult.stdout || "(Code executed with 0 errors)",
      time: execResult.time,
      xpAwarded,
      totalXp,
      currentStreak,
      moduleCompleted,
      message: "Challenge Completed! Great job.",
    });
  } catch (err: unknown) {
    console.error("[Validate API] Uncaught error:", err);
    return NextResponse.json(
      {
        status: "EXECUTION_ERROR",
        passed: false,
        errorTitle: "Execution Service Error",
        output: (err as Error)?.message || "Internal validation error",
        message: "An error occurred during code evaluation.",
      },
      { status: 500 }
    );
  }
}
