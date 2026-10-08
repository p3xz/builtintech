"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Code2,
  CheckCircle2,
  Swords,
  Trophy,
  Activity,
  Flame,
} from "lucide-react";

interface StatsData {
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  globalAcceptanceRate: number;
  totalDuelsFought: number;
  difficulties: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  recentFinishedDuels: Array<{
    roomCode: string;
    problemId: string;
    problemTitle?: string;
    winner?: string;
    player1: { username: string; testsPassed: number; totalTests: number };
    player2?: { username: string; testsPassed: number; totalTests: number };
    createdAt: string;
  }>;
}

export default function PlatformStatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono text-xs">
        Loading platform statistics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono text-xs">
        Failed to load platform data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-3">
          <Activity className="w-3.5 h-3.5" />
          <span>Real-time Telemetry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-mono text-white">
          Platform Statistics
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
          Live server-verified data across coding challenges and AI-refereed duels.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-mono">
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Active Coders</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">{data.totalUsers}</div>
        </div>

        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Duels Refereed</span>
            <Swords className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-400">{data.totalDuelsFought}</div>
        </div>

        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Submissions</span>
            <Code2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{data.totalSubmissions}</div>
        </div>

        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Acceptance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{data.globalAcceptanceRate}%</div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Problems by Difficulty */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 font-mono">
          <h2 className="text-sm uppercase tracking-wider text-zinc-300 font-bold mb-4">
            Curated Problem Distribution
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-emerald-400">Easy Challenges</span>
                <span className="text-zinc-400">{data.difficulties.Easy}</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{
                    width: `${Math.round((data.difficulties.Easy / Math.max(1, data.totalProblems)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-amber-400">Medium Challenges</span>
                <span className="text-zinc-400">{data.difficulties.Medium}</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{
                    width: `${Math.round((data.difficulties.Medium / Math.max(1, data.totalProblems)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-rose-400">Hard Challenges</span>
                <span className="text-zinc-400">{data.difficulties.Hard}</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full"
                  style={{
                    width: `${Math.round((data.difficulties.Hard / Math.max(1, data.totalProblems)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Judge Pipeline Info */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 font-mono">
          <h2 className="text-sm uppercase tracking-wider text-zinc-300 font-bold mb-4">
            AI Referee Architecture
          </h2>
          <div className="space-y-3 text-xs text-zinc-400">
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
              <span>Model Provider</span>
              <span className="text-cyan-400 font-bold">Groq (gpt-oss-20b)</span>
            </div>
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
              <span>Execution Engine</span>
              <span className="text-white font-bold">OnlineCompiler Sync API</span>
            </div>
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
              <span>Correctness Authority</span>
              <span className="text-emerald-400 font-bold">Deterministic Hidden Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Refereed Duels Feed */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold mb-4">
          Recently Concluded Duels
        </h2>

        {data.recentFinishedDuels.length === 0 ? (
          <div className="text-xs font-mono text-zinc-500 py-4 text-center">
            No duels finished yet. Be the first to start a duel!
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {data.recentFinishedDuels.map((d) => (
              <div
                key={d.roomCode}
                className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[11px]">
                    ROOM {d.roomCode}
                  </span>
                  <span className="font-bold text-white">
                    {d.player1.username} vs {d.player2?.username || "Opponent"}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-cyan-400">
                    Winner: <span className="font-bold">{d.winner || "Draw"}</span>
                  </span>
                  <Link href={`/duel/${d.roomCode}/result`}>
                    <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[11px] transition">
                      View Verdict →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
