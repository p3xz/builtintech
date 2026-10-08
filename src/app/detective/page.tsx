"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, FolderSearch, ShieldCheck, CheckCircle2, ArrowRight, Zap, AlertTriangle } from "lucide-react";
import { getDetectiveCasesWithStatus } from "@/services/detectiveService";
import { IDetectiveCase } from "@/types/learning";
import { LoadingState } from "@/components/StatusState";

export default function DetectiveHubPage() {
  const [cases, setCases] = useState<IDetectiveCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getDetectiveCasesWithStatus();
    setCases(list);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 text-xs font-mono font-semibold mb-3">
            <Search className="w-3.5 h-3.5" />
            <span>Incident Response</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Code Detective Dossier
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Analyze server logs, database dumps, and network traces to diagnose real-world production incidents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl font-mono text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Solved Cases</span>
            <span className="text-lg font-bold text-indigo-400">
              {cases.filter((c) => c.isSolved).length} / {cases.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <LoadingState message="Opening incident case files..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              className={`bg-[#121214] border rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition shadow-xl relative overflow-hidden ${
                c.isSolved
                  ? "border-emerald-500/40 bg-[#121214]"
                  : "border-zinc-800 hover:border-indigo-500/40"
              }`}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-800/40 px-3 py-1 rounded-full">
                    {c.caseNumber}
                  </span>

                  <div className="flex items-center gap-2">
                    {c.isSolved ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Solved ✓</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded-full font-bold">
                        <Zap className="w-3 h-3" />
                        <span>+{c.xpReward} XP</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold font-mono text-white mb-2">{c.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{c.subtitle}</p>

                <div className="space-y-2 bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-4 mb-6 text-xs font-mono text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Domain:</span>
                    <span className="text-zinc-200">{c.domain}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Evidence Files:</span>
                    <span className="text-indigo-300 font-bold">{c.evidenceFiles.length} files attached</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Investigation Tasks:</span>
                    <span className="text-zinc-200">{c.tasks.length} objectives</span>
                  </div>
                </div>
              </div>

              <Link href={`/detective/${c.id}`} className="block">
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50">
                  <span>{c.isSolved ? "Review Investigation" : "Open Case File"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
