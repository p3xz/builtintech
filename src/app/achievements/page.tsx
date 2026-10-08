"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { IAchievement } from "@/types/learning";
import { AchievementsSkeleton } from "@/components/Skeletons";

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [achievements, setAchievements] = useState<IAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    async function fetchAchievements() {
      try {
        const res = await fetch("/api/user/achievements");
        if (!res.ok) throw new Error("Failed to load achievements");
        const data = await res.json();
        setAchievements(data.achievements || []);
      } catch (e) {
        setError("Could not load achievements. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, [session, status, router]);

  const categories = [
    { id: "all", name: "All Badges" },
    { id: "learning", name: "Learning" },
    { id: "quiz", name: "Quizzes" },
    { id: "streak", name: "Streaks" },
    { id: "special", name: "Special Missions" },
    { id: "duel", name: "Duels" },
  ];

  const filtered = achievements.filter((a) => {
    return activeCategory === "all" || a.category === activeCategory;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalEarnedXp = achievements.reduce(
    (acc, a) => acc + (a.unlocked ? a.xpReward : 0),
    0
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full font-sans">
        <div className="border-b border-zinc-800 pb-8 mb-8">
          <div className="w-32 h-6 bg-zinc-800/60 rounded-full mb-3 animate-pulse" />
          <div className="w-56 h-9 bg-zinc-800/60 rounded-lg mb-2 animate-pulse" />
          <div className="w-96 h-4 bg-zinc-800/60 rounded animate-pulse" />
        </div>
        <AchievementsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-400 font-mono">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs rounded-xl cursor-pointer hover:bg-zinc-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-400 text-xs font-mono font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Milestones & Rewards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Achievements
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Unlock achievements through consistent daily learning, passing
            checkpoints, and solving missions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl font-mono text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">
              Unlocked
            </span>
            <span className="text-lg font-bold text-amber-400">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl font-mono text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">
              XP Earned
            </span>
            <span className="text-lg font-bold text-cyan-400">
              +{totalEarnedXp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121214] border border-zinc-800 rounded-xl font-mono text-xs w-full sm:w-auto overflow-x-auto mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg transition font-medium cursor-pointer shrink-0 ${
              activeCategory === cat.id
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Achievements Grid or Empty State */}
      {achievements.length === 0 ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-16 text-center max-w-md mx-auto space-y-4">
          <Award className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold font-mono text-white">
            No achievements yet
          </h3>
          <p className="text-xs text-zinc-400">
            Complete lessons, missions, and courses to unlock your first
            achievement.
          </p>
          <Link href="/learn">
            <button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer">
              Start Learning →
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ach) => (
            <div
              key={ach.id}
              className={`border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition relative overflow-hidden ${
                ach.unlocked
                  ? "bg-[#121214] border-amber-500/40 shadow-amber-500/5"
                  : "bg-zinc-950/60 border-zinc-800/80 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      ach.unlocked
                        ? "bg-amber-950/40 border border-amber-800/50"
                        : "bg-zinc-900 border border-zinc-800 grayscale"
                    }`}
                  >
                    {ach.icon}
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full font-bold">
                    +{ach.xpReward} XP
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold font-mono text-white">
                    {ach.title}
                  </h3>
                  {ach.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {ach.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80">
                {ach.unlocked ? (
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                    <span>Unlocked ✓</span>
                    <span className="text-zinc-500">
                      {ach.unlockedAt
                        ? new Date(ach.unlockedAt).toLocaleDateString()
                        : "Recent"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>Progress</span>
                      <span>{ach.progressPercent || 0}%</span>
                    </div>
                    <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-600 h-full rounded-full"
                        style={{ width: `${ach.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
