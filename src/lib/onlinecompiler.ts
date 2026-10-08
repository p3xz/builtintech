export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  output: string;
  time: number;
  memory: number;
  isTimeout: boolean;
  compilationError: boolean;
  runtimeError: boolean;
  systemError?: string;
}

const MAX_CODE_SIZE_BYTES = 100 * 1024; // 100 KB
const MAX_STDIN_SIZE_BYTES = 100 * 1024; // 100 KB
const MAX_OUTPUT_SIZE_CHARS = 256 * 1024; // 256 KB truncate limit

export const ONLINECOMPILER_LANG_MAP: Record<string, string> = {
  python: "python-3.14",
  "python-3.14": "python-3.14",
  javascript: "typescript-deno",
  typescript: "typescript-deno",
  "typescript-deno": "typescript-deno",
  cpp: "g++-15",
  "g++-15": "g++-15",
  c: "gcc-15",
  "gcc-15": "gcc-15",
  java: "openjdk-25",
  "openjdk-25": "openjdk-25",
};

export async function executeCodeOnlineCompilerSyncWithLang(
  languageOrCompiler: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const apiKey = process.env.ONLINECOMPILER_API_KEY || "";
  const compilerId = ONLINECOMPILER_LANG_MAP[languageOrCompiler.toLowerCase().trim()] || "python-3.14";

  // Guard sizes
  if (Buffer.byteLength(code, "utf-8") > MAX_CODE_SIZE_BYTES) {
    return {
      success: false,
      stdout: "",
      stderr: "Code size exceeds 100 KB limit.",
      output: "Code size exceeds 100 KB limit.",
      time: 0,
      memory: 0,
      isTimeout: false,
      compilationError: true,
      runtimeError: false,
    };
  }

  if (Buffer.byteLength(stdin, "utf-8") > MAX_STDIN_SIZE_BYTES) {
    return {
      success: false,
      stdout: "",
      stderr: "Stdin size exceeds 100 KB limit.",
      output: "Stdin size exceeds 100 KB limit.",
      time: 0,
      memory: 0,
      isTimeout: false,
      compilationError: false,
      runtimeError: true,
    };
  }

  if (!apiKey) {
    return {
      success: false,
      stdout: "",
      stderr: "ONLINECOMPILER_API_KEY is not configured in environment.",
      output: "ONLINECOMPILER_API_KEY is not configured in environment.",
      time: 0,
      memory: 0,
      isTimeout: false,
      compilationError: false,
      runtimeError: true,
      systemError: "Execution key not configured on server",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35-second client abort

  try {
    const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey, // Raw API key, NOT Bearer
      },
      body: JSON.stringify({
        compiler: compilerId,
        code,
        input: stdin,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        stdout: "",
        stderr: `HTTP ${response.status}: ${errorText}`,
        output: errorText,
        time: 0,
        memory: 0,
        isTimeout: response.status === 408 || response.status === 504,
        compilationError: false,
        runtimeError: true,
      };
    }

    const data = await response.json();

    const rawStdout = typeof data.stdout === "string" ? data.stdout : "";
    const rawStderr = typeof data.stderr === "string" ? data.stderr : "";
    const rawOutput = typeof data.output === "string" ? data.output : (rawStdout || rawStderr);

    // Truncate output at 256 KB
    const stdout = rawStdout.slice(0, MAX_OUTPUT_SIZE_CHARS);
    const stderr = rawStderr.slice(0, MAX_OUTPUT_SIZE_CHARS);
    const output = rawOutput.slice(0, MAX_OUTPUT_SIZE_CHARS);

    const time = typeof data.time === "number" ? data.time : (parseFloat(data.time) || 0);
    const memory = typeof data.memory === "number" ? data.memory : (parseFloat(data.memory) || 0);

    const statusStr = String(data.status || "").toLowerCase();
    const exitCode = data.exit_code !== undefined ? data.exit_code : null;

    const errorCombined = (stderr + " " + output + " " + statusStr).toLowerCase();

    // Check timeout
    const isTimeout =
      statusStr === "timeout" ||
      errorCombined.includes("timeout") ||
      errorCombined.includes("timed out") ||
      time >= 30;

    // Classify errors
    const isCompError =
      errorCombined.includes("syntaxerror") ||
      errorCombined.includes("indentationerror") ||
      errorCombined.includes("parse error") ||
      errorCombined.includes("compilation failed") ||
      errorCombined.includes("cannot find symbol") ||
      errorCombined.includes("error: expected");

    const isRunError =
      !isCompError &&
      (errorCombined.includes("traceback") ||
        errorCombined.includes("exception") ||
        errorCombined.includes("segmentation fault") ||
        (exitCode !== null && exitCode !== 0) ||
        statusStr === "error" ||
        statusStr === "runtime error");

    const success =
      (statusStr === "success" || statusStr === "") &&
      (exitCode === 0 || exitCode === null) &&
      !isTimeout &&
      !isCompError &&
      !isRunError;

    return {
      success,
      stdout,
      stderr,
      output,
      time,
      memory,
      isTimeout,
      compilationError: isCompError,
      runtimeError: isRunError,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = (err as Error)?.name === "AbortError";
    const msg = isAbort ? "Request aborted after 35s timeout." : (err as Error)?.message || "Unknown execution error";

    return {
      success: false,
      stdout: "",
      stderr: msg,
      output: msg,
      time: isAbort ? 35 : 0,
      memory: 0,
      isTimeout: isAbort,
      compilationError: false,
      runtimeError: true,
    };
  }
}

// Default export signature used across duels and single execution
export async function executeCodeOnlineCompilerSync(
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  return executeCodeOnlineCompilerSyncWithLang("python", code, stdin);
}
