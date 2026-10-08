"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Swords, Zap, Flame, User, Sparkles, ArrowRight } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  image?: string;
  xp: number;
  currentStreak: number;
  duelRating: number;
  duelsPlayed: number;
  duelsWon: number;
  duelsLost: number;
  winRate: number;
  solvedCount: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const json = await res.json();
          setUsers(json.leaderboard || []);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 mb-8 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs font-mono mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Competitive Standings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-mono text-white">
          Duel Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
          Top coders ranked by 1v1 duel rating, win rate, and problem masteries.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[#121214] border border-zinc-800/80 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-12 text-center max-w-md mx-auto font-mono">
          <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-300">No ranked duelists yet</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Complete a 1v1 duel to earn your initial ranking!
          </p>
          <Link href="/duel" className="inline-block mt-4">
            <button className="px-5 py-2 bg-white text-black font-bold text-xs rounded-lg">
              Start First Duel →
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {topThree.map((u, idx) => {
                const podiumColors = [
                  "border-amber-400/40 shadow-[0_0_25px_rgba(251,191,36,0.1)]", // 1st
                  "border-zinc-400/40 shadow-[0_0_20px_rgba(212,212,216,0.08)]", // 2nd
                  "border-amber-700/40 shadow-[0_0_20px_rgba(180,83,9,0.08)]", // 3rd
                ];

                const rankLabels = ["1ST PLACE", "2ND PLACE", "3RD PLACE"];

                return (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className={`bg-[#121214] border rounded-2xl p-6 text-center transition hover:scale-[1.02] flex flex-col justify-between ${
                      podiumColors[idx] || "border-zinc-800"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-3">
                        {rankLabels[idx]}
                      </span>

                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500/20 to-rose-500/20 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xl text-white mx-auto mb-3">
                        {u.displayName[0]?.toUpperCase()}
                      </div>

                      <h3 className="font-mono font-bold text-base text-white truncate mb-0.5">
                        {u.displayName}
                      </h3>
                      <p className="text-xs font-mono text-zinc-500">@{u.username}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Rating</span>
                        <span className="font-bold text-rose-400">⚔️ {u.duelRating}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Win Rate</span>
                        <span className="font-bold text-cyan-400">{u.winRate}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Full Ranked Table */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#151518] flex items-center justify-between font-mono text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-6">
                <span className="w-8">RANK</span>
                <span>CODER</span>
              </div>
              <div className="flex items-center gap-8 sm:gap-12">
                <span className="w-16 text-right">RATING</span>
                <span className="w-16 text-right hidden sm:block">WIN RATE</span>
                <span className="w-16 text-right">XP</span>
              </div>
            </div>

            <div className="divide-y divide-zinc-800/60 font-mono text-xs">
              {users.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.username}`}
                  className="px-6 py-4 flex items-center justify-between hover:bg-zinc-900/50 transition group"
                >
                  <div className="flex items-center gap-6">
                    <span
                      className={`w-8 font-bold ${
                        u.rank === 1
                          ? "text-amber-400"
                          : u.rank === 2
                          ? "text-zinc-300"
                          : u.rank === 3
                          ? "text-amber-600"
                          : "text-zinc-500"
                      }`}
                    >
                      #{u.rank}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
                        {u.displayName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-zinc-200 group-hover:text-cyan-400 transition block">
                          {u.displayName}
                        </span>
                        <span className="text-[11px] text-zinc-500">@{u.username}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 sm:gap-12">
                    <span className="w-16 text-right font-bold text-rose-400">
                      ⚔️ {u.duelRating}
                    </span>
                    <span className="w-16 text-right text-zinc-300 hidden sm:block">
                      {u.winRate}% <span className="text-[10px] text-zinc-500">({u.duelsWon}W)</span>
                    </span>
                    <span className="w-16 text-right text-cyan-400 font-bold">
                      {u.xp}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
