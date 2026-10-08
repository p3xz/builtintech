import {
  executeCodeOnlineCompilerSyncWithLang,
  ExecutionResult,
  ONLINECOMPILER_LANG_MAP,
} from "@/lib/onlinecompiler";

export interface NormalizedExecutionOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  output: string;
  executionTimeMs: number;
  memoryKb: number;
  status: "SUCCESS" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIMEOUT" | "SYSTEM_ERROR";
  error?: string;
}

export async function runCodeOnOnlineCompiler(
  language: string,
  code: string,
  stdin: string = ""
): Promise<NormalizedExecutionOutput> {
  const result: ExecutionResult = await executeCodeOnlineCompilerSyncWithLang(
    language,
    code,
    stdin
  );

  let status: NormalizedExecutionOutput["status"] = "SUCCESS";
  if (result.systemError) {
    status = "SYSTEM_ERROR";
  } else if (result.isTimeout) {
    status = "TIMEOUT";
  } else if (result.compilationError) {
    status = "COMPILE_ERROR";
  } else if (result.runtimeError || !result.success) {
    status = "RUNTIME_ERROR";
  }

  return {
    success: result.success,
    stdout: result.stdout,
    stderr: result.stderr,
    output: result.output || result.stdout || result.stderr,
    executionTimeMs: Math.round(result.time * 1000),
    memoryKb: Math.round(result.memory),
    status,
    error: result.stderr || result.systemError || (result.isTimeout ? "Time Limit Exceeded" : undefined),
  };
}

export { ONLINECOMPILER_LANG_MAP };
