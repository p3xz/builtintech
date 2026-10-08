import { PlayerReadability, PlayerFeedback, PlayerJudgeScore, JudgeResult } from "@/types/room";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";

function getGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY;
}

// 1. Readability Scoring via Groq
export async function scoreReadabilityWithGroq(
  code: string,
  problemTitle: string
): Promise<PlayerReadability> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return fallbackReadability(code);
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        reasoning_effort: "low",
        max_completion_tokens: 256,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "readability_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                score: {
                  type: "integer",
                  description: "Readability score from 1 to 10",
                },
                reason: {
                  type: "string",
                  description: "One-line justification for the score",
                },
              },
              required: ["score", "reason"],
              additionalProperties: false,
            },
          },
        },
        messages: [
          {
            role: "system",
            content: "You are a code readability judge.",
          },
          {
            role: "user",
            content: `Evaluate the readability of this Python solution for "${problemTitle}" on a scale of 1-10. Consider clarity, structure, naming, and Pythonic idioms.\n\n\`\`\`python\n${code}\n\`\`\``,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`Groq readability call failed: HTTP ${response.status}`);
      return fallbackReadability(code);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackReadability(code);

    const parsed = JSON.parse(content);
    return {
      score: Math.min(10, Math.max(1, Number(parsed.score) || 7)),
      reason: String(parsed.reason || "Clean structure and naming."),
    };
  } catch (err) {
    console.error("Groq readability scoring error:", err);
    return fallbackReadability(code);
  }
}

function fallbackReadability(code: string): PlayerReadability {
  const lines = code.split("\n").filter((l) => l.trim().length > 0);
  let score = 7;

  if (code.includes("#")) score += 1;
  if (lines.length > 5 && lines.length < 35) score += 1;
  if (code.includes("def ") && code.includes("return")) score += 1;
  if (lines.some((l) => l.length > 90)) score -= 1;

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    reason:
      score >= 8
        ? "Concise Python structure with clear logic flow."
        : "Standard implementation, could benefit from more descriptive variable names.",
  };
}

// 2. Per-Player Feedback via Groq
export async function getPlayerFeedbackWithGroq(
  code: string,
  problemTitle: string,
  failedTestsSummary: string,
  referenceSolution: string
): Promise<PlayerFeedback> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return fallbackFeedback(failedTestsSummary);
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_completion_tokens: 350,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "player_feedback",
            strict: true,
            schema: {
              type: "object",
              properties: {
                mistakes: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of specific mistakes (max 3, one line each)",
                },
                improvements: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of actionable improvements (max 3, one line each)",
                },
                betterApproach: {
                  type: "string",
                  description: "2-3 lines describing the optimal algorithm/data structure",
                },
              },
              required: ["mistakes", "improvements", "betterApproach"],
              additionalProperties: false,
            },
          },
        },
        messages: [
          {
            role: "system",
            content:
              "You are a competitive programming coach providing targeted feedback to a contestant. Point at what their code actually did wrong and how to fix it.",
          },
          {
            role: "user",
            content: `Problem: ${problemTitle}
Contestant Solution:
\`\`\`python
${code}
\`\`\`

Test Execution Outcome:
${failedTestsSummary}

Reference Optimal Solution (for your calibration only):
\`\`\`python
${referenceSolution}
\`\`\`

Provide coaching feedback tailored to their code.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`Groq feedback call failed: HTTP ${response.status}`);
      return fallbackFeedback(failedTestsSummary);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackFeedback(failedTestsSummary);

    const parsed = JSON.parse(content);
    return {
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes.slice(0, 3) : ["Edge cases not fully handled."],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : ["Use hash maps for O(n) lookups."],
      betterApproach: String(parsed.betterApproach || "Use a single pass with auxiliary state to avoid redundant computation."),
    };
  } catch (err) {
    console.error("Groq feedback error:", err);
    return fallbackFeedback(failedTestsSummary);
  }
}

function fallbackFeedback(failedSummary: string): PlayerFeedback {
  if (failedSummary.toLowerCase().includes("all passed") || failedSummary.toLowerCase().includes("0 failed")) {
    return {
      mistakes: ["No functional errors; all test cases succeeded."],
      improvements: ["Consider micro-optimizations like avoiding intermediate list allocations.", "Add typing hints for enhanced code clarity."],
      betterApproach: "Your approach successfully achieves optimal asymptotic complexity for this problem.",
    };
  }

  return {
    mistakes: ["Did not handle edge cases or larger constraint inputs properly.", "Possible unhandled boundary or type conversion issue."],
    improvements: ["Validate input bounds before processing.", "Consider using hash structures or sliding pointers instead of nested iterations."],
    betterApproach: "A single-pass greedy or hash map approach guarantees optimal linear time complexity and passes all boundary tests.",
  };
}

// 3. Ringside Verdict via Groq
export async function generateVerdictWithGroq(
  p1: PlayerJudgeScore,
  p2: PlayerJudgeScore,
  winner: string | null,
  problemTitle: string
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return fallbackVerdict(p1, p2, winner);
  }

  try {
    const prompt = `Problem: ${problemTitle}

${p1.name}:
- Correctness: ${p1.testsPassed}/${p1.totalTests} tests passed
- Efficiency: ${(p1.runtimeMs / 1000).toFixed(2)}s runtime
- Readability: ${p1.readability.score}/10 (${p1.readability.reason})

${p2.name}:
- Correctness: ${p2.testsPassed}/${p2.totalTests} tests passed
- Efficiency: ${(p2.runtimeMs / 1000).toFixed(2)}s runtime
- Readability: ${p2.readability.score}/10 (${p2.readability.reason})

Official Winner: ${winner ? winner : "Draw"}

Write a dramatic ringside commentator-style verdict declaring the winner and the decisive factor. Maximum 4 lines.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        max_completion_tokens: 256,
        messages: [
          {
            role: "system",
            content: "You are a dramatic ringside commentator for competitive coding duels. Keep verdicts punchy and max 4 lines.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`Groq verdict call failed: HTTP ${response.status}`);
      return fallbackVerdict(p1, p2, winner);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content ? content.trim() : fallbackVerdict(p1, p2, winner);
  } catch (err) {
    console.error("Groq verdict error:", err);
    return fallbackVerdict(p1, p2, winner);
  }
}

function fallbackVerdict(p1: PlayerJudgeScore, p2: PlayerJudgeScore, winner: string | null): string {
  if (winner === p1.name) {
    if (p1.testsPassed > p2.testsPassed) {
      return `${p1.name} takes the crown on pure correctness, passing ${p1.testsPassed}/${p1.totalTests} hidden tests against ${p2.name}'s ${p2.testsPassed}/${p2.totalTests}.\nWhen the edge cases arrived, ${p1.name}'s code held the line.`;
    }
    if (p1.runtimeMs < p2.runtimeMs) {
      return `A dead-heat on correctness, but ${p1.name} blazes ahead on raw speed at ${(p1.runtimeMs / 1000).toFixed(2)}s versus ${(p2.runtimeMs / 1000).toFixed(2)}s.\nEfficiency was the knockout punch in this duel.`;
    }
    return `Both duelists fought toe-to-toe, but ${p1.name} claims victory on code elegance and readability (${p1.readability.score}/10).\nClean code triumphs under pressure.`;
  } else if (winner === p2.name) {
    if (p2.testsPassed > p1.testsPassed) {
      return `${p2.name} takes the crown on pure correctness, passing ${p2.testsPassed}/${p2.totalTests} hidden tests against ${p1.name}'s ${p1.testsPassed}/${p1.totalTests}.\nWhen the edge cases arrived, ${p2.name}'s code held the line.`;
    }
    if (p2.runtimeMs < p1.runtimeMs) {
      return `A dead-heat on correctness, but ${p2.name} blazes ahead on raw speed at ${(p2.runtimeMs / 1000).toFixed(2)}s versus ${(p1.runtimeMs / 1000).toFixed(2)}s.\nEfficiency was the knockout punch in this duel.`;
    }
    return `Both duelists fought toe-to-toe, but ${p2.name} claims victory on code elegance and readability (${p2.readability.score}/10).\nClean code triumphs under pressure.`;
  }

  return `An absolute deadlock! Both ${p1.name} and ${p2.name} delivered matched test scores, parallel runtimes, and equal code craft.\nThe arena salutes an epic draw.`;
}

// 4. Deterministic Winner Resolution
export function determineWinner(p1: PlayerJudgeScore, p2: PlayerJudgeScore): string | null {
  // 1. More hidden tests passed wins
  if (p1.testsPassed > p2.testsPassed) return p1.name;
  if (p2.testsPassed > p1.testsPassed) return p2.name;

  // 2. Tie -> faster efficiency run wins (lower runtimeMs)
  if (p1.runtimeMs < p2.runtimeMs) return p1.name;
  if (p2.runtimeMs < p1.runtimeMs) return p2.name;

  // 3. Tie -> higher readability score wins
  if (p1.readability.score > p2.readability.score) return p1.name;
  if (p2.readability.score > p1.readability.score) return p2.name;

  return null; // Tie
}
