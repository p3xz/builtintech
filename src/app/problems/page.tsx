"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Code2, CheckCircle2, Zap, Swords, ArrowRight, RefreshCw } from "lucide-react";

interface ProblemItem {
  _id: string;
  problemId: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  xp: number;
  isSolved: boolean;
}

export default function ProblemsDirectoryPage() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulty !== "All") params.set("difficulty", selectedDifficulty);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/problems?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);
      }
    } catch (err) {
      console.error("Failed to load problems:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProblems, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty, search]);

  const difficultyColors = {
    Easy: "text-emerald-400 bg-emerald-950/30 border-emerald-800/40",
    Medium: "text-amber-400 bg-amber-950/30 border-amber-800/40",
    Hard: "text-rose-400 bg-rose-950/30 border-rose-800/40",
  };

  const solvedCount = problems.filter((p) => p.isSolved).length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Practice Arena</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Programming Problems
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
            Solve challenges individually or launch 1v1 duels against other coders.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-4">
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl text-center font-mono">
            <span className="text-[10px] text-zinc-500 uppercase block">Total Problems</span>
            <span className="text-lg font-bold text-white">{problems.length}</span>
          </div>
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl text-center font-mono">
            <span className="text-[10px] text-zinc-500 uppercase block">Solved by You</span>
            <span className="text-lg font-bold text-cyan-400">
              {solvedCount} <span className="text-xs text-zinc-500">/ {problems.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or tags..."
            className="w-full bg-[#121214] border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-2.5 text-xs text-white font-mono outline-none transition pl-10"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121214] border border-zinc-800 rounded-lg font-mono text-xs w-full sm:w-auto overflow-x-auto">
          {["All", "Easy", "Medium", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 rounded-md transition font-medium cursor-pointer ${
                selectedDifficulty === diff
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-[#121214] border border-zinc-800/80 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-12 text-center">
          <Code2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold font-mono text-zinc-300">No problems found</h3>
          <p className="text-xs text-zinc-500 mt-1 font-sans">
            Try adjusting your search query or difficulty filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map((prob) => (
            <div
              key={prob.problemId}
              className="bg-[#121214] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition group"
            >
              {/* Problem Info */}
              <div className="flex items-start sm:items-center gap-3.5">
                <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded shrink-0">
                  #{prob.problemId}
                </span>

                <div>
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/problems/${prob.problemId}`}
                      className="font-mono font-bold text-base text-zinc-100 group-hover:text-cyan-400 transition"
                    >
                      {prob.title}
                    </Link>
                    {prob.isSolved && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium ${
                        difficultyColors[prob.difficulty]
                      }`}
                    >
                      {prob.difficulty}
                    </span>

                    {prob.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons & XP */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 px-2.5 py-1 rounded">
                  <Zap className="w-3.5 h-3.5" />
                  <span>+{prob.xp} XP</span>
                </div>

                <Link href={`/problems/${prob.problemId}`}>
                  <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer">
                    Solve
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
