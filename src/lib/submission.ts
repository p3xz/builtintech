import { IUser, SubmissionStatus } from "@/types";
import { Question } from "@/models/Question";
import { Submission } from "@/models/Submission";
import { executeCodeOnlineCompilerSyncWithLang } from "@/lib/onlinecompiler";
import { calculateStreak } from "@/lib/streak";

export interface SubmissionEvaluationResult {
  submissionId: string;
  status: SubmissionStatus;
  runtime: number;
  testsPassed: number;
  totalTests: number;
  awardedXp: number;
  isFirstSolve: boolean;
  currentStreak: number;
  totalXp: number;
  errorDetails?: string;
  failedTestCase?: {
    testCaseIndex: number;
    isPublic: boolean;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
  };
}

export async function evaluateAndRecordSubmission(
  user: IUser,
  problemId: string,
  language: string,
  code: string
): Promise<SubmissionEvaluationResult> {
  const question = await Question.findOne({ problemId, isPublished: true });
  if (!question) {
    throw new Error("Problem not found or unpublished.");
  }

  const testSuite =
    question.hiddenTestCases && question.hiddenTestCases.length > 0
      ? question.hiddenTestCases
      : question.examples.map((ex) => ({
          input: ex.input,
          expectedOutput: ex.output,
        }));

  if (testSuite.length === 0) {
    throw new Error("No test cases configured for this problem.");
  }

  let status: SubmissionStatus = "Accepted";
  let testsPassed = 0;
  let totalRuntime = 0;
  let errorDetails: string | undefined = undefined;
  let failedTestCase: SubmissionEvaluationResult["failedTestCase"] = undefined;

  // Execute test cases sequentially
  for (let i = 0; i < testSuite.length; i++) {
    const testCase = testSuite[i];
    const execResult = await executeCodeOnlineCompilerSyncWithLang(
      language,
      code,
      testCase.input
    );

    totalRuntime += execResult.time;

    if (execResult.systemError) {
      status = "System Error";
      errorDetails = execResult.systemError;
      break;
    }

    if (execResult.compilationError) {
      status = "Compilation Error";
      errorDetails = execResult.stderr || execResult.output;
      break;
    }

    if (execResult.isTimeout) {
      status = "Time Limit Exceeded";
      errorDetails = "Time Limit Exceeded (execution exceeded limit).";
      break;
    }

    if (!execResult.success || execResult.runtimeError) {
      status = "Runtime Error";
      errorDetails = execResult.stderr || execResult.output || "Runtime execution error";
      break;
    }

    // Output normalization
    const normalize = (str: unknown) =>
      String(str ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim()
        .split("\n")
        .map((l) => l.trimEnd())
        .join("\n");

    const actual = normalize(execResult.stdout);
    const expected = normalize(testCase.expectedOutput);

    if (actual === expected) {
      testsPassed++;
    } else {
      status = "Wrong Answer";
      const isPublic = i < question.examples.length;

      failedTestCase = {
        testCaseIndex: i + 1,
        isPublic,
        ...(isPublic
          ? {
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              actualOutput: execResult.stdout.trim().slice(0, 500),
            }
          : {}),
      };

      errorDetails = isPublic
        ? `Example Test ${i + 1} Failed: Output mismatch`
        : `Hidden test case ${i + 1} failed.`;
      break;
    }
  }

  const avgRuntime = Number((totalRuntime / Math.max(1, testsPassed + (status !== "Accepted" ? 1 : 0))).toFixed(3));
  const isFirstAcceptedSolve = status === "Accepted" && !user.solvedProblems.includes(problemId);
  const awardedXp = isFirstAcceptedSolve ? question.xp : 0;

  // Update User progress
  user.totalSubmissions += 1;
  if (!user.attemptedProblems.includes(problemId)) {
    user.attemptedProblems.push(problemId);
  }

  if (status === "Accepted") {
    user.acceptedSubmissions += 1;
    if (isFirstAcceptedSolve) {
      user.xp += awardedXp;
      user.solvedProblems.push(problemId);

      const streakResult = calculateStreak(
        user.currentStreak,
        user.longestStreak,
        user.lastActiveDate
      );
      user.currentStreak = streakResult.currentStreak;
      user.longestStreak = streakResult.longestStreak;
      user.lastActiveDate = streakResult.lastActiveDate;
    }
  }

  await (user as any).save?.();

  // Create submission document
  const submission = await Submission.create({
    userId: user._id.toString(),
    username: user.username,
    problemId: question.problemId,
    problemTitle: question.title,
    language,
    code,
    status,
    runtime: avgRuntime,
    errorDetails,
    testsPassed,
    totalTests: testSuite.length,
    awardedXp,
  });

  return {
    submissionId: submission._id.toString(),
    status,
    runtime: avgRuntime,
    testsPassed,
    totalTests: testSuite.length,
    awardedXp,
    isFirstSolve: isFirstAcceptedSolve,
    currentStreak: user.currentStreak,
    totalXp: user.xp,
    errorDetails: status !== "Accepted" ? errorDetails : undefined,
    failedTestCase,
  };
}
