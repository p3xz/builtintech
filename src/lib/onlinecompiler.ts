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

export function normalizeOutput(str: unknown): string {
  return String(str ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n");
}

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

export function classifyExecutionError(errorText: string): {
  compilationError: boolean;
  runtimeError: boolean;
} {
  if (!errorText || errorText.trim() === "") {
    return { compilationError: false, runtimeError: true };
  }

  const errLower = errorText.toLowerCase();

  // 1. Explicit Runtime Errors (Prioritized over generic tokens)
  const isExplicitRuntime =
    errLower.includes("exception in thread") ||
    errLower.includes("java.lang.") ||
    errLower.includes("traceback (most recent call last)") ||
    errLower.includes("segmentation fault") ||
    errLower.includes("floating point exception") ||
    errLower.includes("aborted (core dumped)") ||
    errLower.includes("sigsegv") ||
    errLower.includes("sigfpe") ||
    errLower.includes("sigabrt") ||
    errLower.includes("terminate called") ||
    errLower.includes("zerodivisionerror") ||
    errLower.includes("indexerror") ||
    errLower.includes("keyerror") ||
    errLower.includes("valueerror") ||
    errLower.includes("nullpointerexception") ||
    errLower.includes("arithmeticexception") ||
    errLower.includes("arrayindexoutofboundsexception") ||
    errLower.includes("stringindexoutofboundsexception") ||
    errLower.includes("nosuchelementexception") ||
    errLower.includes("inputmismatchexception") ||
    errLower.includes("uncaught exception") ||
    errLower.includes("uncaught referenceerror") ||
    errLower.includes("uncaught typeerror") ||
    errLower.includes("uncaught rangeerror");

  if (isExplicitRuntime) {
    return { compilationError: false, runtimeError: true };
  }

  // 2. Explicit Compilation Errors
  const isExplicitCompilation =
    errLower.includes("syntaxerror") ||
    errLower.includes("indentationerror") ||
    errLower.includes("taberror") ||
    errLower.includes("parse error") ||
    errLower.includes("cannot find symbol") ||
    errLower.includes("undefined reference") ||
    errLower.includes("ld returned") ||
    errLower.includes("class, interface, enum, or record expected") ||
    errLower.includes("reached end of file while parsing") ||
    errLower.includes("illegal start of expression") ||
    errLower.includes("not a statement") ||
    errLower.includes("unclosed string literal") ||
    errLower.includes("expected ';'") ||
    errLower.includes("expected ')'") ||
    errLower.includes("expected '}'") ||
    errLower.includes("compilation error") ||
    errLower.includes("compilation failed") ||
    errLower.includes("fatal error:") ||
    (errLower.includes("error:") && !errLower.includes("runtime error")) ||
    /\b\w+\.(?:java|cpp|c|cc|cxx):\d+/i.test(errorText);

  if (isExplicitCompilation) {
    return { compilationError: true, runtimeError: false };
  }

  return { compilationError: false, runtimeError: true };
}

export async function executeCodeOnlineCompilerSyncWithLang(
  languageOrCompiler: string,
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const apiKey = process.env.ONLINECOMPILER_API_KEY || "";
  const compilerId =
    ONLINECOMPILER_LANG_MAP[languageOrCompiler.toLowerCase().trim()] || "python-3.14";

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
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35-second abort limit

  try {
    const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey, // Raw API key (without Bearer prefix)
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

    // OnlineCompiler API returns output in 'output' or 'stdout', error in 'error' or 'stderr'
    const rawStdout =
      (typeof data.output === "string" && data.output.length > 0)
        ? data.output
        : (typeof data.stdout === "string" ? data.stdout : "");

    const rawStderr =
      (typeof data.error === "string" && data.error.length > 0)
        ? data.error
        : (typeof data.stderr === "string" ? data.stderr : "");

    const stdout = rawStdout.slice(0, MAX_OUTPUT_SIZE_CHARS);
    const stderr = rawStderr.slice(0, MAX_OUTPUT_SIZE_CHARS);
    const output = (stdout || stderr).slice(0, MAX_OUTPUT_SIZE_CHARS);

    const time = typeof data.time === "number" ? data.time : parseFloat(data.time) || 0;
    const memory = typeof data.memory === "number" ? data.memory : parseFloat(data.memory) || 0;

    const statusStr = String(data.status || "").toLowerCase();
    const exitCode = typeof data.exit_code === "number" ? data.exit_code : null;

    const isSuccess =
      (statusStr === "success" || statusStr === "") &&
      (exitCode === 0 || exitCode === null) &&
      stderr.length === 0;

    const isTimeout =
      statusStr === "timeout" ||
      stderr.toLowerCase().includes("timeout") ||
      stderr.toLowerCase().includes("timed out") ||
      time >= 30;

    let compError = false;
    let runError = false;

    if (!isSuccess && !isTimeout) {
      const classified = classifyExecutionError(stderr || output || "Execution Error");
      compError = classified.compilationError;
      runError = classified.runtimeError;
    }

    return {
      success: isSuccess && !isTimeout && !compError && !runError,
      stdout,
      stderr,
      output,
      time,
      memory,
      isTimeout,
      compilationError: compError,
      runtimeError: runError,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = (err as Error)?.name === "AbortError";
    const msg = isAbort
      ? "Request aborted after 35s timeout."
      : (err as Error)?.message || "Unknown execution error";

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

export async function executeCodeOnlineCompilerSync(
  code: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  return executeCodeOnlineCompilerSyncWithLang("python", code, stdin);
}
