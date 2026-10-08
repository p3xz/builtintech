"use client";

import React, { useState, useEffect } from "react";
import { Play, RotateCcw, ChevronLeft, ChevronRight, Eye, Code, Terminal, Variable } from "lucide-react";
import { IExecutionTrace, IExecutionStep } from "@/types/learning";

interface ExecutionVisualizerProps {
  language: string;
  code: string;
  initialTrace?: IExecutionTrace | null;
}

export default function ExecutionVisualizer({
  language,
  code,
  initialTrace,
}: ExecutionVisualizerProps) {
  const [trace, setTrace] = useState<IExecutionTrace | null>(initialTrace || null);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchTrace = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/learning/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrace(data.trace);
        setCurrentStepIndex(0);
      } else {
        setError("Failed to generate execution trace");
      }
    } catch {
      setError("Network error generating visualization");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTrace) {
      fetchTrace();
    } else {
      setTrace(initialTrace);
      setCurrentStepIndex(0);
    }
  }, [code, language]);

  const currentStep: IExecutionStep | undefined = trace?.steps[currentStepIndex];
  const totalSteps = trace?.steps.length || 0;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
  };

  const codeLines = code.split("\n");

  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col font-mono text-xs">
      {/* Header Bar */}
      <div className="bg-[#18181b] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider text-xs">
            Code Execution Visualizer
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {language}
          </span>
        </div>

        {/* Step Progression Badge */}
        {totalSteps > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-xs">
              Step <strong className="text-cyan-400">{currentStepIndex + 1}</strong> of{" "}
              <strong className="text-white">{totalSteps}</strong>
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-zinc-400">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Generating execution trace...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-rose-400">
          <p>{error}</p>
          <button
            onClick={fetchTrace}
            className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs cursor-pointer"
          >
            Retry Visualization
          </button>
        </div>
      ) : !trace || totalSteps === 0 ? (
        <div className="p-8 text-center text-zinc-500">
          No execution steps available. Write executable statements to view trace.
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Main Visualization Grid: Code on left, Variables & State on right */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-zinc-800 min-h-[220px]">
            {/* Left: Code with Active Line Highlight */}
            <div className="md:col-span-6 border-b md:border-b-0 md:border-r border-zinc-800 p-3 bg-[#0d0d0f] overflow-x-auto">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Program Flow</span>
              </div>
              <div className="space-y-1">
                {codeLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isCurrentLine = currentStep?.line === lineNum;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-2 py-0.5 rounded transition-all ${
                        isCurrentLine
                          ? "bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 font-bold"
                          : "text-zinc-400"
                      }`}
                    >
                      <span
                        className={`w-6 text-right select-none text-[10px] ${
                          isCurrentLine ? "text-cyan-400 font-bold" : "text-zinc-600"
                        }`}
                      >
                        {lineNum}
                      </span>
                      <span className="w-3">
                        {isCurrentLine && <span className="text-cyan-400 animate-pulse">▶</span>}
                      </span>
                      <span className="truncate">{line || " "}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Variables & State Inspector */}
            <div className="md:col-span-6 p-4 bg-[#121214] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Variable className="w-3.5 h-3.5 text-amber-400" />
                  <span>Variables in Scope</span>
                </div>

                {currentStep && Object.keys(currentStep.variables).length > 0 ? (
                  <div className="border border-zinc-800 rounded-lg overflow-hidden bg-[#18181b]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                        <tr>
                          <th className="px-3 py-1.5 font-semibold">Variable</th>
                          <th className="px-3 py-1.5 font-semibold">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {Object.entries(currentStep.variables).map(([name, val]) => (
                          <tr key={name} className="hover:bg-zinc-800/40">
                            <td className="px-3 py-1.5 text-amber-400 font-semibold">{name}</td>
                            <td className="px-3 py-1.5 text-zinc-200">
                              {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 text-center">
                    No variables assigned yet.
                  </div>
                )}

                {/* Explanation */}
                {currentStep?.explanation && (
                  <div className="mt-3 p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-[11px]">
                    <span className="text-cyan-400 font-semibold">Action: </span>
                    {currentStep.explanation}
                  </div>
                )}
              </div>

              {/* Console Output */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Program Output (stdout)</span>
                </div>
                <div className="p-2 rounded bg-black/60 border border-zinc-800 text-emerald-400 font-mono text-[11px] min-h-[36px] max-h-[70px] overflow-y-auto">
                  {currentStep?.stdout || <span className="text-zinc-600 italic">(Empty output)</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Controls Toolbar */}
          <div className="bg-[#18181b] px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition cursor-pointer"
                title="Restart Execution"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Restart</span>
              </button>

              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-xs transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Step</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentStepIndex >= totalSteps - 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded text-xs transition cursor-pointer shadow-sm"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slider Scrubber */}
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <input
                type="range"
                min={0}
                max={totalSteps - 1}
                value={currentStepIndex}
                onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
