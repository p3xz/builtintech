"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Play,
  ArrowRight,
  Flame,
  Zap,
  Target,
  Award,
  Sparkles,
  BookOpen,
  Code2,
  Swords,
  Search,
  Layers,
  Terminal,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import ConstellationField from "@/components/ConstellationField";
import GlowHorizonFM from "@/components/ui/glow-horizon";
import DailyMissionCard from "@/components/DailyMissionCard";
import { getLocalProgress, getDecoratedCourse } from "@/services/courseService";
import { getDailyMission, calculateLevelFromXp } from "@/services/progressService";
import { getAllCourses, getCourseById } from "@/data/courses";
import { getAllAchievements } from "@/data/achievements";
import { getUserCertificates } from "@/services/certificateService";
import { getPublicProjects } from "@/services/projectService";
import { ICourse } from "@/types/learning";

export default function DashboardHomePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<ICourse | null>(null);
  const [currentModuleName, setCurrentModuleName] = useState<string>("Python Basics & Core Types");
  const [currentLessonName, setCurrentLessonName] = useState<string>("Variables & Data Types");
  const [currentCourseProgress, setCurrentCourseProgress] = useState<number>(33);
  const [currentLessonId, setCurrentLessonId] = useState<string>("variables-and-data-types");
  const [currentModuleId, setCurrentModuleId] = useState<string>("python-basics");
  const [currentCourseId, setCurrentCourseId] = useState<string>("python-fundamentals");

  const [userXp, setUserXp] = useState(450);
  const [streakCount, setStreakCount] = useState(4);
  const [longestStreak, setLongestStreak] = useState(7);
  const [dailyMission, setDailyMission] = useState(getDailyMission());

  useEffect(() => {
    setMounted(true);
    const progress = getLocalProgress();
    const courseId = progress.currentCourseId || "python-fundamentals";
    const rawCourse = getCourseById(courseId) || getAllCourses()[0];

    if (rawCourse) {
      const decorated = getDecoratedCourse(rawCourse, progress);
      setCurrentCourse(decorated);
      setCurrentCourseId(decorated.courseId);
      setCurrentCourseProgress(decorated.progressPercent || 33);

      const mod = decorated.modules.find((m) => m.moduleId === progress.currentModuleId) || decorated.modules[0];
      if (mod) {
        setCurrentModuleName(mod.title);
        setCurrentModuleId(mod.moduleId);

        const les = mod.lessons.find((l) => l.lessonId === progress.currentLessonId) || mod.lessons[0];
        if (les) {
          setCurrentLessonName(les.title);
          setCurrentLessonId(les.lessonId);
        }
      }
    }

    const calculatedXp = progress.completedLessonIds.length * 25 + progress.passedQuizIds.length * 100;
    setUserXp(Math.max(calculatedXp, 450));
    setDailyMission(getDailyMission());
  }, []);

  const levelInfo = calculateLevelFromXp(userXp);
  const allAchievements = getAllAchievements();
  const unlockedAchievements = allAchievements.filter((a) => a.unlocked);
  const certificates = mounted ? getUserCertificates() : [];
  const publicProjects = mounted ? getPublicProjects().slice(0, 2) : [];

  return (
    <main className="relative min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Particle Stars */}
      <ConstellationField />

      {/* Top Horizon Glow */}
      <GlowHorizonFM variant="top" className="opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* ── 1. DASHBOARD HEADER: Welcome & Quick Orientation ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Learner Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              Continue Your Journey
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
              Pick up right where you left off or explore new modules.
            </p>
          </div>

          {/* Quick Onboarding / Reconfigure Pill */}
          <Link href="/onboarding">
            <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono text-zinc-300 hover:text-white transition flex items-center gap-2 cursor-pointer">
              <span>Change Learning Track</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </Link>
        </div>

        {/* ── 2. PRIMARY HERO SECTION: "What Should I Do Next?" ── */}
        <section aria-label="Continue Learning Next Action" className="relative">
          <div className="bg-gradient-to-br from-[#121214] via-[#16161a] to-[#121214] border-2 border-cyan-500/30 hover:border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
            {/* Background Glow Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Details */}
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{currentCourse?.icon || "🐍"}</span>
                  <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-semibold">
                    {currentCourse?.title || "Python Fundamentals"}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Module 1 &bull; Lesson 2
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                    {currentLessonName}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans leading-relaxed">
                    Module: <strong className="text-zinc-200">{currentModuleName}</strong>. Complete the interactive sandbox activity to advance.
                  </p>
                </div>

                {/* Course Progress Bar */}
                <div className="space-y-1.5 max-w-md pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Course Progress</span>
                    <span className="text-cyan-400 font-bold">{currentCourseProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800/90 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-sky-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentCourseProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Big CTA Action */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  href={`/learn/${currentCourseId}/${currentModuleId}/${currentLessonId}`}
                  className="w-full sm:w-auto"
                >
                  <button className="w-full px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold rounded-2xl text-sm sm:text-base transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.25)] flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]">
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link href={`/learn/${currentCourseId}`} className="w-full sm:w-auto">
                  <button className="w-full px-6 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 font-mono text-xs font-semibold rounded-xl transition cursor-pointer text-center">
                    View Course Modules Map
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. SECONDARY LEARNER METRICS GRID (Calm & Informative) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Daily Mission */}
          <DailyMissionCard mission={dailyMission} />

          {/* Card B: Progress & Level */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>XP & Level</span>
                </div>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded-full font-bold">
                  Level {levelInfo.level}
                </span>
              </div>

              <h4 className="text-xl font-bold font-mono text-white mb-1">
                {userXp} <span className="text-xs text-zinc-400 font-sans font-normal">total XP</span>
              </h4>
              <p className="text-xs text-zinc-400">
                {levelInfo.xpForNextLevel - levelInfo.xpInCurrentLevel} XP until Level {levelInfo.level + 1}
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-500 text-[11px]">Level Progress</span>
                <span className="text-indigo-400 font-bold">{levelInfo.progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-800/90 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card C: Coding Streak */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Streak Status</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full font-bold">
                  Active Today
                </span>
              </div>

              <h4 className="text-xl font-bold font-mono text-white mb-1">
                {streakCount} <span className="text-xs text-zinc-400 font-sans font-normal">Day Streak</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Longest streak record: <strong className="text-zinc-200">{longestStreak} days</strong>
              </p>
            </div>

            {/* Visual Consistency Dots */}
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-800/60">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-zinc-500">{day}</span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                      idx < streakCount
                        ? "bg-amber-400 text-black font-bold shadow-sm shadow-amber-500/20"
                        : "bg-zinc-800 text-zinc-600"
                    }`}
                  >
                    {idx < streakCount ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. FEATURED LEARNING HUBS & GAME MODES ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Explore Learning Modes</span>
            </h3>
            <Link href="/learn" className="text-xs font-mono text-cyan-400 hover:underline">
              Browse All Tracks →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mode 1: Code Detective */}
            <Link href="/detective" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-indigo-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/50 border border-indigo-800/40 text-indigo-400 flex items-center justify-center mb-3">
                    <Search className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-indigo-400 transition">
                    Code Detective
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Investigate server logs, inspect clues, and diagnose production incidents.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-indigo-400 mt-3 block font-semibold">
                  Open Case Files →
                </span>
              </div>
            </Link>

            {/* Mode 2: Code Architect */}
            <Link href="/architect" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-cyan-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mb-3">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-cyan-400 transition">
                    Code Architect
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Build multi-phase data structures and production systems step-by-step.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 mt-3 block font-semibold">
                  Build Systems →
                </span>
              </div>
            </Link>

            {/* Mode 3: Practice Arena */}
            <Link href="/problems" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-amber-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-950/50 border border-amber-800/40 text-amber-400 flex items-center justify-center mb-3">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-amber-400 transition">
                    Practice Arena
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Solve targeted algorithmic coding problems across 5 programming languages.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-amber-400 mt-3 block font-semibold">
                  Solve Challenges →
                </span>
              </div>
            </Link>

            {/* Mode 4: 1v1 Live Duels */}
            <Link href="/duel" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-rose-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-rose-950/50 border border-rose-800/40 text-rose-400 flex items-center justify-center mb-3">
                    <Swords className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-rose-400 transition">
                    1v1 Live Duels
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Real-time head-to-head coding matches refereed by an AI judge.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-rose-400 mt-3 block font-semibold">
                  Enter Duel Arena →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── 5. SECONDARY SECTION: Achievements & Community Projects Preview ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/80">
          {/* Left: Achievements Preview */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold font-mono text-white">Recent Achievements</h4>
              </div>
              <Link href="/achievements" className="text-xs font-mono text-cyan-400 hover:underline">
                View All ({unlockedAchievements.length}) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {allAchievements.slice(0, 3).map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    ach.unlocked
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-200"
                      : "bg-zinc-900/20 border-zinc-800/40 text-zinc-500 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ach.icon}</span>
                    <div>
                      <div className="text-xs font-mono font-bold">{ach.title}</div>
                      <div className="text-[11px] text-zinc-400">{ach.description}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold shrink-0">
                    +{ach.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code Studio & Community Projects */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold font-mono text-white">Personal Code Studio</h4>
                </div>
                <Link href="/studio" className="text-xs font-mono text-cyan-400 hover:underline">
                  Open Studio →
                </Link>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Your personal sandbox workspace to write, execute, save, and share private or public projects across multiple languages.
              </p>

              {publicProjects.length > 0 && (
                <div className="space-y-2">
                  {publicProjects.map((proj) => (
                    <Link key={proj.id} href={`/projects`}>
                      <div className="p-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 transition flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-200 truncate">{proj.title}</span>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded uppercase">
                          {proj.language}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">Prototype Certificates</span>
              <Link href="/certificates" className="text-xs font-mono text-emerald-400 hover:underline">
                View Certificates ({certificates.length}) →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
