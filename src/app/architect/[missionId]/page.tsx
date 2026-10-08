"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  Layers,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Code2,
  Terminal,
  HelpCircle,
  RotateCcw,
  Shield,
  Zap,
} from "lucide-react";
import { getArchitectMissionById } from "@/data/architect-missions";
import { validateArchitectPhase } from "@/services/architectService";
import { IArchitectMission, IArchitectPhase } from "@/types/learning";
import { LoadingState, ErrorState } from "@/components/StatusState";

export default function ArchitectMissionWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const missionId = typeof params.missionId === "string" ? params.missionId : "";

  const [mission, setMission] = useState<IArchitectMission | null>(null);
  const [activePhaseNumber, setActivePhaseNumber] = useState(1);
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{ name: string; passed: boolean; message: string }>
  >([]);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!missionId) return;
    const found = getArchitectMissionById(missionId);
    if (found) {
      setMission(found);
      const initialPhase = found.phases.find((p) => p.phaseNumber === activePhaseNumber) || found.phases[0];
      setCode(initialPhase.starterCode);
    }
    setLoading(false);
  }, [missionId]);

  useEffect(() => {
    if (mission) {
      const current = mission.phases.find((p) => p.phaseNumber === activePhaseNumber);
      if (current) {
        setCode(current.starterCode);
        setTestResults([]);
        setPhaseCompleted(false);
      }
    }
  }, [activePhaseNumber, mission]);

  if (loading) return <LoadingState message="Connecting to system architect environment..." />;
  if (!mission) return <ErrorState title="Mission Not Found" />;

  const activePhase: IArchitectPhase | undefined = mission.phases.find(
    (p) => p.phaseNumber === activePhaseNumber
  );

  const handleRunTests = () => {
    if (!activePhase) return;
    setIsRunning(true);

    setTimeout(() => {
      const result = validateArchitectPhase(mission.id, activePhase.phaseNumber, code);
      setTestResults(result.testResults);
      setPhaseCompleted(result.allPassed);
      setIsRunning(false);
    }, 400);
  };

  const handleNextPhase = () => {
    if (activePhaseNumber < mission.phases.length) {
      setActivePhaseNumber((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] font-sans pb-16">
      {/* Top Sticky Bar */}
      <div className="sticky top-12 z-30 bg-[#121214]/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-400 truncate">
            <Link href="/architect" className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Missions</span>
            </Link>
            <span>/</span>
            <span className="text-white font-bold">{mission.title}</span>
            <span>/</span>
            <span className="text-cyan-400">Phase {activePhaseNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Language:</span>
            <span className="text-cyan-400 font-bold uppercase">{mission.language}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Phase Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {mission.phases.map((p) => {
            const isCurrent = p.phaseNumber === activePhaseNumber;
            return (
              <button
                key={p.phaseNumber}
                onClick={() => setActivePhaseNumber(p.phaseNumber)}
                className={`p-3 rounded-2xl border text-left font-mono text-xs transition cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? "bg-cyan-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/30 font-bold"
                    : "bg-[#121214] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Phase {p.phaseNumber}</span>
                  <span className="truncate block max-w-[120px]">{p.title.split(":")[1] || p.title}</span>
                </div>
                {p.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Phase Layout: Requirements on left (4 cols), Code & Test Runner on right (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Phase Requirements & Blueprint (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {activePhase && (
              <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider">
                      Phase {activePhase.phaseNumber}
                    </span>
                    <span className="text-[11px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full font-bold">
                      +{activePhase.xp} XP
                    </span>
                  </div>
                  <h2 className="text-base font-bold font-mono text-white">{activePhase.title}</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {activePhase.description}
                  </p>
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Phase Requirements:
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {activePhase.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#18181b] p-2.5 rounded-xl border border-zinc-800/80">
                        <span className="text-cyan-400 font-bold">&bull;</span>
                        <span className="font-mono text-[11px] leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hint Box */}
                {activePhase.hint && (
                  <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
                    <span className="font-mono font-bold block text-[11px] text-cyan-400 mb-0.5">Architecture Hint:</span>
                    {activePhase.hint}
                  </div>
                )}
              </div>
            )}

            {/* Architecture ASCII Blueprint */}
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                System Blueprint
              </span>
              <pre className="p-3 bg-[#0d0d0f] border border-zinc-800/80 rounded-xl font-mono text-[10px] text-cyan-300/80 overflow-x-auto leading-tight">
                {mission.blueprint}
              </pre>
            </div>
          </div>

          {/* Right: Code Workspace & Test Harness (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Editor Container */}
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-[#18181b] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 uppercase font-semibold">
                  {mission.language} Implementation Workspace
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCode(activePhase?.starterCode || "")}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Code</span>
                  </button>

                  <button
                    onClick={handleRunTests}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold rounded-lg transition cursor-pointer shadow-sm shadow-cyan-500/20 active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isRunning ? "Running Harness..." : "Run Phase Tests"}</span>
                  </button>
                </div>
              </div>

              <div className="h-[360px]">
                <Editor
                  height="100%"
                  language={mission.language === "cpp" ? "cpp" : mission.language}
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    padding: { top: 10, bottom: 10 },
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* Test Harness Execution Results */}
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test Harness Results</span>
                </span>
                {testResults.length > 0 && (
                  <span
                    className={`font-bold ${
                      phaseCompleted ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {testResults.filter((t) => t.passed).length} / {testResults.length} Passed
                  </span>
                )}
              </div>

              {testResults.length === 0 ? (
                <div className="p-4 bg-black/60 border border-zinc-800/80 rounded-xl text-xs font-mono text-zinc-500 text-center">
                  Click &quot;Run Phase Tests&quot; to compile and execute test suites against your architecture code.
                </div>
              ) : (
                <div className="space-y-2">
                  {testResults.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                        t.passed
                          ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                          : "bg-rose-950/30 border-rose-900/40 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>{t.name}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">{t.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {phaseCompleted && (
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Phase {activePhaseNumber} Completed! (+{activePhase?.xp} XP)</span>
                  </div>

                  {activePhaseNumber < mission.phases.length ? (
                    <button
                      onClick={handleNextPhase}
                      className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg"
                    >
                      <span>Proceed to Phase {activePhaseNumber + 1}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link href="/architect">
                      <button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer">
                        Mission Fully Architected! Return to Hub →
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
