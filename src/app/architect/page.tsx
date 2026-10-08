"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, CheckCircle2, ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import { getArchitectMissionsWithStatus } from "@/services/architectService";
import { IArchitectMission } from "@/types/learning";
import { LoadingState } from "@/components/StatusState";

export default function ArchitectHubPage() {
  const [missions, setMissions] = useState<IArchitectMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getArchitectMissionsWithStatus();
    setMissions(list);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Systems Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Code Architect Missions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Build production-grade data structures and distributed systems phase-by-phase with automated test harnesses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl font-mono text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Active Missions</span>
            <span className="text-lg font-bold text-cyan-400">{missions.length}</span>
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      {loading ? (
        <LoadingState message="Loading architecture blueprints..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map((m) => {
            const completedPhasesCount = m.phases.filter((p) => p.isCompleted).length;
            const progressPercent = Math.round((completedPhasesCount / m.phases.length) * 100);

            return (
              <div
                key={m.id}
                className="bg-[#121214] border border-zinc-800 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition shadow-xl relative overflow-hidden"
              >
                {/* Glow Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">
                      {m.missionNumber}
                    </span>

                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded-full font-bold">
                      +{m.totalXp} XP
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-mono text-white mb-2">{m.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">{m.subtitle}</p>

                  {/* Phases Preview */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                      Architect Phases ({completedPhasesCount}/{m.phases.length} completed):
                    </span>
                    <div className="space-y-1.5">
                      {m.phases.map((p) => (
                        <div
                          key={p.phaseNumber}
                          className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-[#18181b] border border-zinc-800"
                        >
                          <span className="text-zinc-300 truncate">{p.title}</span>
                          {p.isCompleted ? (
                            <span className="text-emerald-400 font-bold text-[11px]">✓ Done</span>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">Pending</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <Link href={`/architect/${m.id}`}>
                    <button className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                      <span>Launch Mission Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
