import { NextRequest, NextResponse } from "next/server";
import { getPublicProblem } from "@/lib/problems";
import { executeCodeOnlineCompilerSyncWithLang } from "@/lib/onlinecompiler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId, language = "python", code, customInput } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    if (customInput !== undefined && typeof customInput === "string") {
      // Run single execution with custom input
      const execResult = await executeCodeOnlineCompilerSyncWithLang(
        language,
        code,
        customInput
      );

      return NextResponse.json({
        type: "custom",
        success: execResult.success,
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        time: execResult.time,
        isTimeout: execResult.isTimeout,
        compilationError: execResult.compilationError,
        runtimeError: execResult.runtimeError,
      });
    }

    // Run against public examples
    const problem = problemId ? await getPublicProblem(problemId) : null;
    const examples = problem?.examples || [{ input: "", output: "" }];

    const results = [];
    for (let i = 0; i < examples.length; i++) {
      const ex = examples[i];
      const execResult = await executeCodeOnlineCompilerSyncWithLang(
        language,
        code,
        ex.input
      );

      const normalize = (s: string) => s.trim().replace(/\r\n/g, "\n");
      const passed = normalize(execResult.stdout) === normalize(ex.output);

      results.push({
        exampleIndex: i + 1,
        input: ex.input,
        expectedOutput: ex.output,
        actualOutput: execResult.stdout,
        stderr: execResult.stderr,
        time: execResult.time,
        passed,
        isTimeout: execResult.isTimeout,
        compilationError: execResult.compilationError,
        runtimeError: execResult.runtimeError,
      });
    }

    const allPassed = results.every((r) => r.passed);

    return NextResponse.json({
      type: "examples",
      allPassed,
      results,
    });
  } catch (err: unknown) {
    console.error("[API POST /api/problems/run] Error:", err);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
