"use client";

import React from "react";
import { Zap, CheckCircle2, Target } from "lucide-react";
import { IDailyMission } from "@/types/learning";

interface DailyMissionCardProps {
  mission: IDailyMission;
}

export default function DailyMissionCard({ mission }: DailyMissionCardProps) {
  const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));

  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between font-sans relative overflow-hidden group hover:border-zinc-700 transition">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daily Mission</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            <span>+{mission.xpReward} XP</span>
          </div>
        </div>

        <h4 className="text-sm font-bold text-white mb-1">{mission.title}</h4>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{mission.description}</p>
      </div>

      {/* Progress Bar & Status */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-zinc-500 text-[11px]">Progress</span>
          <span className="text-zinc-300 font-bold">
            {mission.current} / {mission.target}
          </span>
        </div>
        <div className="w-full bg-zinc-800/90 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              mission.completed ? "bg-emerald-400" : "bg-cyan-400"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {mission.completed && (
          <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Mission Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
