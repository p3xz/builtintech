// Server-side Python code execution via child process
import { execFile } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  runtimeMs: number;
}

export async function executePython(
  code: string,
  timeoutMs: number = 10000
): Promise<ExecutionResult> {
  const dir = join(tmpdir(), 'clashjudge');
  await mkdir(dir, { recursive: true });
  const filename = `cj_${randomUUID().slice(0, 8)}.py`;
  const filepath = join(dir, filename);

  await writeFile(filepath, code, 'utf-8');

  return new Promise((resolve) => {
    const start = Date.now();
    const child = execFile(
      'python',
      [filepath],
      { timeout: timeoutMs, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        const runtimeMs = Date.now() - start;
        // Clean up temp file
        unlink(filepath).catch(() => {});

        if (error && (error as any).killed) {
          resolve({
            stdout: stdout || '',
            stderr: stderr || 'Execution timed out',
            exitCode: 1,
            timedOut: true,
            runtimeMs,
          });
          return;
        }

        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: error ? (error as any).code || 1 : 0,
          timedOut: false,
          runtimeMs,
        });
      }
    );
  });
}

export interface TestCase {
  input: Record<string, any>;
  expected: any;
}

export interface TestRunResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  runtimeMs: number;
}

function buildTestScript(
  userCode: string,
  problemId: string,
  testCase: TestCase
): string {
  // Map problem ID to function name the user should define
  const fnMap: Record<string, string> = {
    'two-sum': 'two_sum',
    'best-time-to-buy-sell-stock': 'max_profit',
    'valid-parentheses': 'is_valid',
    'longest-substring-no-repeat': 'length_of_longest_substring',
    'maximum-subarray': 'max_subarray',
    'reverse-integer': 'reverse_integer',
  };

  const fnName = fnMap[problemId] || 'solution';
  const args = Object.entries(testCase.input)
    .map(([, v]) => JSON.stringify(v))
    .join(', ');

  return `
import json, sys, time

# User code
${userCode}

# Test runner
try:
    _start = time.perf_counter()
    _result = ${fnName}(${args})
    _elapsed = time.perf_counter() - _start
    print(json.dumps({"result": _result, "time_ms": round(_elapsed * 1000, 2)}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;
}

function buildPerfScript(
  userCode: string,
  problemId: string,
  generateInput: string,
  expected: any
): string {
  const fnMap: Record<string, string> = {
    'two-sum': 'two_sum',
    'best-time-to-buy-sell-stock': 'max_profit',
    'valid-parentheses': 'is_valid',
    'longest-substring-no-repeat': 'length_of_longest_substring',
    'maximum-subarray': 'max_subarray',
    'reverse-integer': 'reverse_integer',
  };

  const fnName = fnMap[problemId] || 'solution';

  // Build arg names from the generateInput (e.g. "nums = list(range(100000)); target = 199997" -> call with nums, target)
  const argNames = generateInput
    .split(';')
    .map((s) => s.trim().split('=')[0].trim())
    .filter(Boolean);
  const argStr = argNames.join(', ');

  return `
import json, sys, time

# User code
${userCode}

# Generate input
${generateInput}

# Perf test
try:
    _start = time.perf_counter()
    _result = ${fnName}(${argStr})
    _elapsed = time.perf_counter() - _start
    print(json.dumps({"result": _result, "time_ms": round(_elapsed * 1000, 2)}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;
}

export async function runTest(
  userCode: string,
  problemId: string,
  testCase: TestCase,
  timeoutMs: number = 5000
): Promise<TestRunResult> {
  const script = buildTestScript(userCode, problemId, testCase);
  const result = await executePython(script, timeoutMs);

  if (result.timedOut) {
    return {
      passed: false,
      input: JSON.stringify(testCase.input),
      expected: JSON.stringify(testCase.expected),
      actual: 'TIMEOUT',
      error: 'Execution timed out',
      runtimeMs: result.runtimeMs,
    };
  }

  if (result.exitCode !== 0) {
    return {
      passed: false,
      input: JSON.stringify(testCase.input),
      expected: JSON.stringify(testCase.expected),
      actual: '',
      error: result.stderr || 'Runtime error',
      runtimeMs: result.runtimeMs,
    };
  }

  try {
    const output = JSON.parse(result.stdout.trim());
    if (output.error) {
      return {
        passed: false,
        input: JSON.stringify(testCase.input),
        expected: JSON.stringify(testCase.expected),
        actual: '',
        error: output.error,
        runtimeMs: result.runtimeMs,
      };
    }

    // Compare results — handle array order for two-sum
    let passed = false;
    if (Array.isArray(testCase.expected) && Array.isArray(output.result)) {
      if (problemId === 'two-sum') {
        // Two sum: order doesn't matter
        const sortedExpected = [...testCase.expected].sort((a, b) => a - b);
        const sortedActual = [...output.result].sort((a, b) => a - b);
        passed = JSON.stringify(sortedExpected) === JSON.stringify(sortedActual);
      } else {
        passed = JSON.stringify(testCase.expected) === JSON.stringify(output.result);
      }
    } else {
      passed = JSON.stringify(testCase.expected) === JSON.stringify(output.result);
    }

    return {
      passed,
      input: JSON.stringify(testCase.input),
      expected: JSON.stringify(testCase.expected),
      actual: JSON.stringify(output.result),
      runtimeMs: output.time_ms || result.runtimeMs,
    };
  } catch {
    return {
      passed: false,
      input: JSON.stringify(testCase.input),
      expected: JSON.stringify(testCase.expected),
      actual: result.stdout,
      error: 'Failed to parse output',
      runtimeMs: result.runtimeMs,
    };
  }
}

export async function runPerfProbe(
  userCode: string,
  problemId: string,
  generateInput: string,
  expected: any,
  timeoutMs: number = 2000
): Promise<TestRunResult> {
  const script = buildPerfScript(userCode, problemId, generateInput, expected);
  const result = await executePython(script, timeoutMs);

  if (result.timedOut) {
    return {
      passed: false,
      input: 'Performance probe (large input)',
      expected: JSON.stringify(expected),
      actual: 'TIMEOUT',
      error: `Exceeded ${timeoutMs}ms time limit`,
      runtimeMs: result.runtimeMs,
    };
  }

  if (result.exitCode !== 0) {
    return {
      passed: false,
      input: 'Performance probe (large input)',
      expected: JSON.stringify(expected),
      actual: '',
      error: result.stderr || 'Runtime error',
      runtimeMs: result.runtimeMs,
    };
  }

  try {
    const output = JSON.parse(result.stdout.trim());
    if (output.error) {
      return {
        passed: false,
        input: 'Performance probe (large input)',
        expected: JSON.stringify(expected),
        actual: '',
        error: output.error,
        runtimeMs: result.runtimeMs,
      };
    }

    // For perf probes with null expected (e.g., maximum-subarray), just check it ran
    let passed = true;
    if (expected !== null) {
      if (Array.isArray(expected) && Array.isArray(output.result)) {
        if (problemId === 'two-sum') {
          const se = [...expected].sort((a: number, b: number) => a - b);
          const sa = [...output.result].sort((a: number, b: number) => a - b);
          passed = JSON.stringify(se) === JSON.stringify(sa);
        } else {
          passed = JSON.stringify(expected) === JSON.stringify(output.result);
        }
      } else {
        passed = JSON.stringify(expected) === JSON.stringify(output.result);
      }
    }

    return {
      passed,
      input: 'Performance probe (large input)',
      expected: expected !== null ? JSON.stringify(expected) : 'N/A',
      actual: JSON.stringify(output.result),
      runtimeMs: output.time_ms || result.runtimeMs,
    };
  } catch {
    return {
      passed: false,
      input: 'Performance probe (large input)',
      expected: JSON.stringify(expected),
      actual: result.stdout,
      error: 'Failed to parse output',
      runtimeMs: result.runtimeMs,
    };
  }
}
