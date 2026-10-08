"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import {
  Play,
  Send,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Swords,
  RotateCcw,
  Terminal,
  History,
  Tag,
  Code2,
} from "lucide-react";
import { PublicProblemData } from "@/lib/problems";
import { SubmissionEvaluationResult } from "@/lib/submission";

interface SubmissionHistoryItem {
  id: string;
  status: string;
  language: string;
  runtime: number;
  testsPassed: number;
  totalTests: number;
  createdAt: string;
}

export default function SingleProblemPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [problem, setProblem] = useState<PublicProblemData | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [language, setLanguage] = useState<"python" | "javascript" | "cpp" | "java" | "c">("python");
  const [code, setCode] = useState<string>("");

  // Execution state
  const [activeTab, setActiveTab] = useState<"examples" | "custom" | "result" | "history">("examples");
  const [customStdin, setCustomStdin] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submissions history
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Run results
  const [runResult, setRunResult] = useState<{
    type: "examples" | "custom";
    allPassed?: boolean;
    stdout?: string;
    stderr?: string;
    time?: number;
    results?: Array<{
      exampleIndex: number;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
      time?: number;
      stderr?: string;
    }>;
  } | null>(null);

  // Submit results
  const [submitResult, setSubmitResult] = useState<SubmissionEvaluationResult | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Fetch problem data & restore draft
  useEffect(() => {
    if (!id) return;
    const loadProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/problems/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data.problem);
          setIsSolved(data.userState?.isSolved || false);

          // Check if user has saved draft in localStorage
          const draftKey = `clashjudge_draft_${data.problem.problemId}_${language}`;
          const savedDraft = localStorage.getItem(draftKey);

          if (savedDraft && savedDraft.trim()) {
            setCode(savedDraft);
          } else {
            const starter = data.problem.starterTemplates?.[language] || "";
            setCode(starter);
          }
        } else {
          setError("Problem not found or unpublished.");
        }
      } catch {
        setError("Failed to load problem details.");
      } finally {
        setLoading(false);
      }
    };
    loadProblem();
  }, [id, language]);

  // Fetch submission history
  const fetchSubmissionHistory = useCallback(async () => {
    if (!id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/problems/${id}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissionHistory(data.submissions || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingHistory(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchSubmissionHistory();
    }
  }, [activeTab, fetchSubmissionHistory]);

  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || "";
    setCode(val);
    if (problem) {
      localStorage.setItem(`clashjudge_draft_${problem.problemId}_${language}`, val);
    }
  };

  const handleLanguageChange = (newLang: "python" | "javascript" | "cpp" | "java" | "c") => {
    setLanguage(newLang);
    if (problem) {
      const draftKey = `clashjudge_draft_${problem.problemId}_${newLang}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && savedDraft.trim()) {
        setCode(savedDraft);
      } else if (problem.starterTemplates?.[newLang]) {
        setCode(problem.starterTemplates[newLang] || "");
      }
    }
  };

  const handleResetTemplate = () => {
    if (problem?.starterTemplates?.[language]) {
      const defaultTemplate = problem.starterTemplates[language] || "";
      setCode(defaultTemplate);
      localStorage.setItem(`clashjudge_draft_${problem.problemId}_${language}`, defaultTemplate);
    }
  };

  // Run code against public examples or custom stdin
  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setActiveTab(activeTab === "custom" ? "custom" : "examples");

    try {
      const res = await fetch("/api/problems/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem?.problemId,
          language,
          code,
          customInput: activeTab === "custom" ? customStdin : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRunResult(data);
      }
    } catch (err) {
      console.error("Run failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code against hidden test cases
  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting || !problem) return;
    setIsSubmitting(true);
    setActiveTab("result");

    try {
      const res = await fetch("/api/problems/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.problemId,
          language,
          code,
        }),
      });

      if (res.ok) {
        const data: SubmissionEvaluationResult = await res.json();
        setSubmitResult(data);
        if (data.status === "Accepted") {
          setIsSolved(true);
          setIsSuccessModalOpen(true);
        }
        fetchSubmissionHistory();
      }
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono text-xs">
        Loading problem workspace...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-[#0a0a0b] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-xl font-bold font-mono text-zinc-200">{error || "Problem Not Found"}</h2>
        <Link href="/problems">
          <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-xs font-mono">
            ← Return to Problems
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-[#0a0a0b] text-[#f4f4f5] overflow-hidden">
      {/* Top Workspace Bar */}
      <div className="h-10 border-b border-zinc-800 bg-[#121214] px-4 flex items-center justify-between shrink-0 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Problems
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="font-bold text-white">
            #{problem.problemId} {problem.title}
          </span>
          {isSolved && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5 rounded font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Solved
            </span>
          )}
        </div>

        {/* Action button: Duel with this Problem */}
        <Link href={`/?problem=${problem.problemId}#lobby`}>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/40 text-cyan-400 text-xs font-semibold rounded-md transition cursor-pointer">
            <Swords className="w-3.5 h-3.5" />
            Duel on this problem →
          </button>
        </Link>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 grid grid-cols-12 min-h-0">
        {/* Left: Problem Statement & Examples */}
        <div className="col-span-12 lg:col-span-5 border-r border-zinc-800 bg-[#121214] p-5 overflow-y-auto flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-2.5 py-0.5 rounded border font-semibold ${
                  problem.difficulty === "Very Easy" || problem.difficulty === "Easy"
                    ? "text-emerald-400 bg-emerald-950/30 border-emerald-800/40"
                    : problem.difficulty === "Medium"
                    ? "text-amber-400 bg-amber-950/30 border-amber-800/40"
                    : "text-rose-400 bg-rose-950/30 border-rose-800/40"
                }`}
              >
                {problem.difficulty}
              </span>
              {problem.tags && problem.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {problem.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1 font-bold">
              <Zap className="w-3.5 h-3.5" />
              +{problem.xp} XP
            </span>
          </div>

          <h1 className="text-2xl font-bold font-mono text-white mb-4">
            {problem.title}
          </h1>

          <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-4 font-sans whitespace-pre-wrap mb-6">
            {problem.description}
          </div>

          {problem.constraints && problem.constraints.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                Constraints
              </h3>
              <ul className="list-disc list-inside text-xs font-mono text-zinc-400 space-y-1">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples Section */}
          <div className="mt-auto pt-4 border-t border-zinc-800/80">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3">
              Examples
            </h3>
            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-mono"
                >
                  <div className="text-zinc-500 mb-1">Input:</div>
                  <pre className="bg-black/50 p-2 rounded mb-2 text-zinc-200 overflow-x-auto whitespace-pre-wrap">
                    {ex.input}
                  </pre>
                  <div className="text-zinc-500 mb-1">Output:</div>
                  <pre className="bg-black/50 p-2 rounded text-cyan-400 overflow-x-auto whitespace-pre-wrap">
                    {ex.output}
                  </pre>
                  {ex.explanation && (
                    <div className="text-zinc-400 text-[11px] mt-2 italic">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Monaco Editor & Output Drawer */}
        <div className="col-span-12 lg:col-span-7 flex flex-col bg-[#0a0a0b]">
          {/* Editor Header */}
          <div className="h-10 border-b border-zinc-800 bg-[#121214] px-4 flex items-center justify-between shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-700 text-xs font-mono text-white rounded px-2.5 py-1 outline-none cursor-pointer"
              >
                <option value="python">Python 3.14</option>
                <option value="javascript">JavaScript (Deno)</option>
                <option value="cpp">C++ (g++ 15)</option>
                <option value="java">Java (OpenJDK 25)</option>
                <option value="c">C (gcc 15)</option>
              </select>
            </div>

            <button
              onClick={handleResetTemplate}
              className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Template
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={language === "cpp" || language === "c" ? "cpp" : language}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output Drawer / Terminal */}
          <div className="h-44 border-t border-zinc-800 bg-[#121214] flex flex-col shrink-0">
            {/* Tabs */}
            <div className="h-8 border-b border-zinc-800/80 px-3 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("examples")}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-t transition ${
                  activeTab === "examples"
                    ? "bg-[#1a1a1e] text-white border-b-2 border-cyan-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Example Tests
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-t transition ${
                  activeTab === "custom"
                    ? "bg-[#1a1a1e] text-white border-b-2 border-cyan-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Custom Stdin
              </button>
              <button
                onClick={() => setActiveTab("result")}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-t transition ${
                  activeTab === "result"
                    ? "bg-[#1a1a1e] text-white border-b-2 border-cyan-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Submission Result
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-t transition flex items-center gap-1 ${
                  activeTab === "history"
                    ? "bg-[#1a1a1e] text-white border-b-2 border-cyan-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <History className="w-3 h-3" />
                History
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-3 overflow-y-auto text-xs font-mono bg-[#0e0e10]">
              {activeTab === "examples" && (
                <div>
                  {runResult?.type === "examples" && runResult.results ? (
                    <div className="space-y-2">
                      <div
                        className={`text-xs font-bold ${
                          runResult.allPassed ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {runResult.allPassed
                          ? "✓ All Example Cases Passed!"
                          : "✗ Some Example Cases Failed"}
                      </div>
                      {runResult.results.map((r, i) => (
                        <div
                          key={i}
                          className="bg-black/40 border border-zinc-800 p-2 rounded"
                        >
                          <div className="flex items-center justify-between text-zinc-400 mb-1">
                            <span>Case {r.exampleIndex}</span>
                            <span className={r.passed ? "text-emerald-400" : "text-rose-400"}>
                              {r.passed ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                          <div>Actual: {r.actualOutput || "(empty)"}</div>
                          {!r.passed && <div className="text-zinc-500">Expected: {r.expectedOutput}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-500">
                      Click &quot;Run Code&quot; to test your solution against example test cases.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "custom" && (
                <div className="h-full flex flex-col gap-2">
                  <textarea
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    placeholder="Enter custom input here..."
                    className="w-full flex-1 bg-black/40 border border-zinc-800 rounded p-2 text-white font-mono text-xs outline-none"
                  />
                  {runResult?.type === "custom" && (
                    <div className="bg-black/60 p-2 rounded border border-zinc-800 text-zinc-200">
                      <span className="text-zinc-500 block mb-1">Output:</span>
                      <pre className="whitespace-pre-wrap">{runResult.stdout || runResult.stderr || "(empty)"}</pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "result" && (
                <div>
                  {submitResult ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            submitResult.status === "Accepted"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {submitResult.status}
                        </span>
                        <span className="text-zinc-400">
                          ({submitResult.testsPassed}/{submitResult.totalTests} tests passed)
                        </span>
                      </div>
                      <div className="text-zinc-400">
                        Runtime: {submitResult.runtime}s | Total XP: {submitResult.totalXp}
                      </div>
                      {submitResult.errorDetails && (
                        <div className="p-2 bg-rose-950/30 border border-rose-800/40 text-rose-300 rounded whitespace-pre-wrap">
                          {submitResult.errorDetails}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-zinc-500">
                      Click &quot;Submit Solution&quot; to test against hidden test cases.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  {loadingHistory ? (
                    <div className="text-zinc-500">Loading submission records...</div>
                  ) : submissionHistory.length > 0 ? (
                    <div className="space-y-1.5">
                      {submissionHistory.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-black/40 border border-zinc-800 p-2 rounded flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                sub.status === "Accepted" ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-zinc-500 font-mono">({sub.language})</span>
                          </div>
                          <div className="text-zinc-400 text-[11px] flex items-center gap-3">
                            <span>{sub.testsPassed}/{sub.totalTests} tests</span>
                            <span>{sub.runtime}s</span>
                            <span className="text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-500">No submissions recorded yet for this problem.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Execution Action Bar */}
          <div className="h-12 border-t border-zinc-800 bg-[#121214] px-4 flex items-center justify-between shrink-0">
            <div className="text-xs font-mono text-zinc-500">
              Draft auto-saved
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-mono font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                {isRunning ? "Running..." : "Run Code"}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="px-5 py-1.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Evaluating..." : "Submit Solution"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && submitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-emerald-500/40 rounded-2xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(16,185,129,0.15)] text-center space-y-4 animate-count-up">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold font-mono text-white">Accepted!</h2>
            <p className="text-xs text-zinc-400">
              All {submitResult.totalTests} hidden test cases passed successfully.
            </p>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-800 font-mono">
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 uppercase block">Awarded XP</span>
                <span className="text-xl font-bold text-cyan-400">+{submitResult.awardedXp} XP</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 uppercase block">Current Streak</span>
                <span className="text-xl font-bold text-amber-400">🔥 {submitResult.currentStreak} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-lg transition"
              >
                Keep Coding
              </button>
              <Link href="/problems" className="flex-1">
                <button className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold rounded-lg transition">
                  Next Problem →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
