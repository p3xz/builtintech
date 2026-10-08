"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  FileText,
  Terminal,
  Database,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Award,
  ChevronRight,
} from "lucide-react";
import { getDetectiveCaseById } from "@/data/detective-cases";
import {
  evaluateDetectiveTask,
  markDetectiveCaseSolved,
} from "@/services/detectiveService";
import { IDetectiveCase, IEvidenceFile, IDetectiveTask } from "@/types/learning";
import { LoadingState, ErrorState } from "@/components/StatusState";

export default function DetectiveCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = typeof params.caseId === "string" ? params.caseId : "";

  const [caseData, setCaseData] = useState<IDetectiveCase | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string | number>>({});
  const [taskFeedback, setTaskFeedback] = useState<
    Record<string, { correct: boolean; feedback: string }>
  >({});
  const [isCaseComplete, setIsCaseComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) return;
    const found = getDetectiveCaseById(caseId);
    if (found) {
      setCaseData(found);
    }
    setLoading(false);
  }, [caseId]);

  if (loading) return <LoadingState message="Decryption in progress..." />;
  if (!caseData) return <ErrorState title="Case File Not Found" />;

  const activeFile: IEvidenceFile | undefined = caseData.evidenceFiles[activeFileIndex];

  const handleTaskSubmit = (task: IDetectiveTask) => {
    const currentAnswer = taskAnswers[task.id];
    if (currentAnswer === undefined || currentAnswer === "") return;

    const result = evaluateDetectiveTask(caseData.id, task.id, currentAnswer);
    setTaskFeedback((prev) => ({
      ...prev,
      [task.id]: result,
    }));

    // Check if all tasks are correct
    const updatedFeedback = {
      ...taskFeedback,
      [task.id]: result,
    };
    const allDone = caseData.tasks.every((t) => updatedFeedback[t.id]?.correct);
    if (allDone) {
      setIsCaseComplete(true);
      markDetectiveCaseSolved(caseData.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full font-sans pb-16">
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/detective"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Case Hub</span>
        </Link>

        <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-800/40 px-3 py-1 rounded-full uppercase">
          {caseData.caseNumber} Dossier
        </span>
      </div>

      {/* Case Header Banner */}
      <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-semibold">
            {caseData.domain}
          </span>
          <span className="text-xs font-mono text-zinc-500">
            Reward: +{caseData.xpReward} XP
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-mono text-white">
          {caseData.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
          {caseData.scenario}
        </p>
      </div>

      {/* Main Two-Column Investigation Layout: Evidence on Left, Investigation Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Evidence File Explorer & Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Evidence Artifacts</span>
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              Click files to inspect contents
            </span>
          </div>

          {/* Evidence File Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {caseData.evidenceFiles.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-mono transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeFileIndex === idx
                    ? "bg-indigo-950/60 border-indigo-500 text-indigo-200 font-bold"
                    : "bg-[#121214] border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {file.type === "sql" ? (
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          {/* File Viewer Box */}
          {activeFile && (
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-[#18181b] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>{activeFile.name}</span>
                <span className="text-[11px] text-zinc-500 uppercase">{activeFile.type} file</span>
              </div>
              <pre className="p-4 bg-[#0d0d0f] font-mono text-xs text-indigo-200/90 overflow-x-auto min-h-[260px] max-h-[420px] overflow-y-auto leading-relaxed">
                {activeFile.content}
              </pre>
            </div>
          )}

          {/* Clues Box */}
          {activeFile?.clues && activeFile.clues.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-indigo-300 space-y-1.5">
              <span className="font-bold font-mono text-[11px] uppercase tracking-wider block text-indigo-400">
                Investigator Clues & Notes:
              </span>
              {activeFile.clues.map((c, i) => (
                <p key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-400">&bull;</span>
                  <span>{c}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right: Tasks & Deduction Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Investigation Tasks</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {caseData.tasks.filter((t) => taskFeedback[t.id]?.correct).length} / {caseData.tasks.length} verified
            </span>
          </div>

          {/* Case Solved Banner */}
          {isCaseComplete && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-mono text-white">Case Solved!</h4>
              <p className="text-xs text-emerald-300 leading-relaxed">
                {caseData.solutionSummary}
              </p>
              <div className="pt-2">
                <Link href="/detective">
                  <button className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer">
                    Return to Case Hub
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-4">
            {caseData.tasks.map((task, tIdx) => {
              const fb = taskFeedback[task.id];
              const isCorrect = fb?.correct;

              return (
                <div
                  key={task.id}
                  className={`bg-[#121214] border rounded-2xl p-5 space-y-3 transition ${
                    isCorrect
                      ? "border-emerald-500/40 bg-[#121214]"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold uppercase tracking-wider">
                      Task {tIdx + 1}
                    </span>
                    <span className="text-[11px] text-zinc-500">+{task.xp} XP</span>
                  </div>

                  <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                    {task.prompt}
                  </p>

                  {/* Task Input by Type */}
                  {task.type === "choice" && task.options && (
                    <div className="space-y-2">
                      {task.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          disabled={isCorrect}
                          onClick={() =>
                            setTaskAnswers((prev) => ({
                              ...prev,
                              [task.id]: oIdx,
                            }))
                          }
                          className={`w-full text-left p-3 rounded-xl border font-mono text-xs transition cursor-pointer flex items-center justify-between ${
                            taskAnswers[task.id] === oIdx
                              ? "bg-indigo-950/40 border-indigo-400 text-indigo-200"
                              : "bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                          }`}
                        >
                          <span>{opt}</span>
                          {taskAnswers[task.id] === oIdx && <span className="text-indigo-400 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {(task.type === "text" || task.type === "query") && (
                    <div>
                      <input
                        type="text"
                        disabled={isCorrect}
                        value={String(taskAnswers[task.id] || "")}
                        onChange={(e) =>
                          setTaskAnswers((prev) => ({
                            ...prev,
                            [task.id]: e.target.value,
                          }))
                        }
                        placeholder={task.type === "query" ? "SELECT * FROM..." : "Enter deduced value..."}
                        className="w-full bg-[#18181b] border border-zinc-700 focus:border-indigo-400 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white outline-none"
                      />
                    </div>
                  )}

                  {/* Feedback line */}
                  {fb && (
                    <div
                      className={`p-3 rounded-xl border text-[11px] flex items-center gap-2 ${
                        isCorrect
                          ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                          : "bg-rose-950/30 border-rose-900/40 text-rose-300"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{fb.feedback}</span>
                    </div>
                  )}

                  {!isCorrect && (
                    <button
                      onClick={() => handleTaskSubmit(task)}
                      disabled={taskAnswers[task.id] === undefined || taskAnswers[task.id] === ""}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-semibold text-xs rounded-xl transition cursor-pointer shadow-sm"
                    >
                      Verify Clue
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
