import { executeCodeOnlineCompilerSyncWithLang, normalizeOutput } from './onlinecompiler';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryKb: number;
  error?: string | null;
}

export async function executeCodeLocally(language: string, code: string, stdinText: string = ''): Promise<ExecutionResult> {
  const start = Date.now();
  const res = await executeCodeOnlineCompilerSyncWithLang(language, code, stdinText);
  const duration = Math.round(res.time * 1000) || (Date.now() - start);

  let errorMsg: string | null = null;
  let exitCode = 0;

  if (res.compilationError) {
    exitCode = 1;
    errorMsg = res.stderr || 'Compilation Error';
  } else if (res.runtimeError) {
    exitCode = 1;
    errorMsg = res.stderr || 'Runtime Error';
  } else if (res.isTimeout) {
    exitCode = 124;
    errorMsg = 'Time Limit Exceeded';
  } else if (!res.success) {
    exitCode = 1;
    errorMsg = res.stderr || 'Execution failed';
  }

  return {
    stdout: res.stdout,
    stderr: res.stderr,
    exitCode,
    executionTimeMs: duration,
    memoryKb: Math.round(res.memory * 1024) || 512,
    error: errorMsg,
  };
}

export async function runCodeTestsLocally(
  language: string,
  code: string,
  testCases: Array<{ input: string; expectedOutput: string; name?: string; isHidden?: boolean }>
) {
  const start = Date.now();
  const results = [];
  let allPassed = true;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const name = tc.name || `Test Case #${i + 1}`;
    const exp = normalizeOutput(tc.expectedOutput);
    const execRes = await executeCodeLocally(language, code, tc.input);
    const actual = normalizeOutput(execRes.stdout);

    const passed = (actual === exp || exp === '') && execRes.exitCode === 0;
    if (!passed) allPassed = false;

    results.push({
      name,
      passed,
      input: tc.isHidden ? '<hidden>' : tc.input,
      expectedOutput: tc.isHidden ? '<hidden>' : tc.expectedOutput,
      actualOutput: tc.isHidden && !passed ? '<hidden output>' : execRes.stdout,
      executionTimeMs: execRes.executionTimeMs,
      error: execRes.error,
    });
  }

  return {
    language,
    totalTests: testCases.length,
    passedTests: results.filter((r) => r.passed).length,
    allPassed,
    results,
    totalTimeMs: Date.now() - start + 15,
  };
}


export function generateExecutionVisualization(language: string, code: string) {
  const lines = code.split('\n');
  const steps = [];
  const simulatedVars: Record<string, any> = {};
  const stdoutBuf: string[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    const assignMatch = line.match(/(?:let|const|var|int|float|double)?\s*([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
    if (assignMatch) {
      simulatedVars[assignMatch[1]] = {
        type: 'literal',
        value: assignMatch[2].trim(),
        repr: assignMatch[2].trim(),
      };
    }

    if (line.includes('print') || line.includes('console.log')) {
      const clean = line.replace(/^[a-zA-Z0-9_\.:<>\s\(\)]+[\("']/, '').replace(/\);?"?$/, '');
      stdoutBuf.push(clean);
    }

    steps.push({
      step: steps.length + 1,
      line: idx + 1,
      event: 'line',
      stdout: stdoutBuf.join('\n'),
      variables: JSON.parse(JSON.stringify(simulatedVars)),
      callStack: ['<main>'],
      lineContent: rawLine,
    });
  }

  return {
    language,
    totalSteps: steps.length,
    steps,
    finalOutput: stdoutBuf.join('\n'),
    error: null,
  };
}

export function renderCertificateSvg(cert: {
  certificateId: string;
  recipientName: string;
  title: string;
  scorePercentage: number;
  issuedAt: Date;
}) {
  const dateStr = new Date(cert.issuedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>

  <rect width="1000" height="700" fill="url(#bgGrad)" />
  <rect x="25" y="25" width="950" height="650" rx="16" fill="none" stroke="url(#borderGrad)" stroke-width="3" opacity="0.8" />
  <rect x="40" y="40" width="920" height="620" rx="12" fill="none" stroke="#334155" stroke-width="1.5" />

  <g transform="translate(500, 110)" text-anchor="middle">
    <text font-family="'Segoe UI', Helvetica, sans-serif" font-weight="900" font-size="34" fill="url(#goldGrad)" letter-spacing="4">⚡ BUILT IN TECH ACADEMY</text>
    <text y="32" font-family="'Segoe UI', Helvetica, sans-serif" font-weight="500" font-size="14" fill="#94a3b8" letter-spacing="2">BUILT IN TECH LEARNING ECOSYSTEM</text>
  </g>

  <g transform="translate(500, 200)" text-anchor="middle">
    <text font-family="'Georgia', serif" font-style="italic" font-size="20" fill="#cbd5e1">This is proudly presented to</text>
    <text y="50" font-family="'Segoe UI', Helvetica, sans-serif" font-weight="800" font-size="38" fill="#f8fafc" letter-spacing="1">${cert.recipientName}</text>
    <line x1="-250" y1="70" x2="250" y2="70" stroke="url(#borderGrad)" stroke-width="2" />
  </g>

  <g transform="translate(500, 320)" text-anchor="middle">
    <text font-family="'Segoe UI', Helvetica, sans-serif" font-size="17" fill="#94a3b8">for successfully demonstrating mastery in</text>
    <text y="42" font-family="'Segoe UI', Helvetica, sans-serif" font-weight="700" font-size="28" fill="url(#goldGrad)">${cert.title}</text>
    <text y="78" font-family="'Segoe UI', Helvetica, sans-serif" font-size="15" fill="#64748b">Final Grade Score: <tspan fill="#38bdf8" font-weight="bold">${cert.scorePercentage}%</tspan> &bull; Verified Prototype</text>
  </g>

  <g transform="translate(140, 540)">
    <line x1="0" y1="0" x2="200" y2="0" stroke="#475569" stroke-width="1.5" />
    <text y="24" font-family="'Segoe UI', sans-serif" font-size="13" fill="#cbd5e1" font-weight="600">DATE ISSUED</text>
    <text y="44" font-family="'Segoe UI', sans-serif" font-size="14" fill="#94a3b8">${dateStr}</text>
  </g>

  <g transform="translate(660, 540)">
    <line x1="0" y1="0" x2="200" y2="0" stroke="#475569" stroke-width="1.5" />
    <text y="24" font-family="'Segoe UI', sans-serif" font-size="13" fill="#cbd5e1" font-weight="600">CERTIFICATE ID</text>
    <text y="44" font-family="'Consolas', monospace" font-size="12" fill="#38bdf8">${cert.certificateId}</text>
  </g>
</svg>`;
}
