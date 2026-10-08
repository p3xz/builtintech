"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  ArrowRight,
  Flame,
  Zap,
  Sparkles,
  BookOpen,
  Code2,
  Swords,
  Search,
  Layers,
  Terminal,
  Award,
  ChevronRight,
  Rocket,
  CheckCircle2,
  Play,
  Globe,
  Shield,
  Star,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import ConstellationField from "@/components/ConstellationField";
import GlowHorizonFM from "@/components/ui/glow-horizon";
import { calculateLevelFromXp } from "@/services/progressService";
import { getDecoratedCourse } from "@/services/courseService";
import { getCourseById } from "@/data/courses";
import { ICourse } from "@/types/learning";

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
interface UserProgress {
  preferredLanguage?: string;
  experienceLevel?: string;
  currentCourseId?: string;
  currentModuleId?: string;
  currentLessonId?: string;
  enrolledCourseIds: string[];
  completedLessonIds: string[];
  completedModuleIds: string[];
  passedQuizIds: string[];
  xp: number;
  currentStreak: number;
  longestStreak: number;
  dailyMissionCurrent: number;
  dailyMissionCompleted: boolean;
  solvedCases: string[];
}

// ──────────────────────────────────────────
// HERO / LANDING PAGE (unauthenticated)
// ──────────────────────────────────────────
function HeroLandingPage() {
  const LANGUAGES = [
    { name: "Python", emoji: "🐍", color: "text-yellow-400" },
    { name: "JavaScript", emoji: "⚡", color: "text-amber-400" },
    { name: "TypeScript", emoji: "🔷", color: "text-blue-400" },
    { name: "Java", emoji: "☕", color: "text-orange-400" },
    { name: "C++", emoji: "⚙️", color: "text-sky-400" },
    { name: "SQL", emoji: "🗄️", color: "text-emerald-400" },
    { name: "HTML/CSS", emoji: "🎨", color: "text-pink-400" },
    { name: "Swift", emoji: "🍎", color: "text-rose-400" },
    { name: "Ruby", emoji: "💎", color: "text-red-400" },
    { name: "PHP", emoji: "🐘", color: "text-indigo-400" },
    { name: "C", emoji: "🔩", color: "text-zinc-400" },
    { name: "C#", emoji: "🎮", color: "text-purple-400" },
  ];

  const FEATURES = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-cyan-400",
      bg: "bg-cyan-950/40 border-cyan-800/40",
      title: "Structured Courses",
      desc: "Follow a clear path: modules → lessons → practice → quiz. Always know what comes next.",
    },
    {
      icon: <Search className="w-5 h-5" />,
      color: "text-indigo-400",
      bg: "bg-indigo-950/40 border-indigo-800/40",
      title: "Code Detective",
      desc: "Diagnose production incidents. Inspect server logs, trace bugs, and solve mystery cases.",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      color: "text-cyan-400",
      bg: "bg-cyan-950/40 border-cyan-800/40",
      title: "Code Architect",
      desc: "Build real systems step-by-step — from data structures to production-ready components.",
    },
    {
      icon: <Swords className="w-5 h-5" />,
      color: "text-rose-400",
      bg: "bg-rose-950/40 border-rose-800/40",
      title: "1v1 Live Duels",
      desc: "Compete in real-time coding matches against other learners. An AI judge scores each round.",
    },
    {
      icon: <Award className="w-5 h-5" />,
      color: "text-amber-400",
      bg: "bg-amber-950/40 border-amber-800/40",
      title: "Achievements & XP",
      desc: "Earn XP, unlock achievements, climb levels, and collect verifiable course certificates.",
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      color: "text-emerald-400",
      bg: "bg-emerald-950/40 border-emerald-800/40",
      title: "Personal Code Studio",
      desc: "Your private sandbox to write, execute, save, and share multi-language coding projects.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col selection:bg-cyan-500/30 overflow-x-hidden">
      <ConstellationField />
      <GlowHorizonFM variant="top" className="opacity-40 pointer-events-none" />

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Real-World Coding Skills — Structured Learning</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white mb-6 leading-tight">
          Learn to Code.{" "}
          <span className="text-cyan-400">Actually.</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-sans">
          Built In Tech is a structured coding learning platform. Follow clear
          learning paths, solve real problems, earn achievements, and compete in
          live duels — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold rounded-2xl text-sm transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 cursor-pointer">
              <Rocket className="w-4 h-4" />
              Start Learning Free
            </button>
          </Link>
          <Link href="/login">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono font-semibold rounded-2xl text-sm transition cursor-pointer">
              Log In
            </button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mt-10 text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Free to join
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> 13 languages
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" /> Earn certificates
          </span>
        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16">
        <h2 className="text-center text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
          Supported Programming Languages
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 hover:border-zinc-600 transition"
            >
              <span>{lang.emoji}</span>
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white mb-2">
            How the Learning System Works
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            A clear, structured loop so you always know what to do next.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-center gap-4 text-center text-xs font-mono">
          {[
            { step: "1", label: "Choose Language", icon: "🌐" },
            { step: "2", label: "Choose Level", icon: "📊" },
            { step: "3", label: "Learn Lessons", icon: "📚" },
            { step: "4", label: "Practice", icon: "💻" },
            { step: "5", label: "Module Quiz", icon: "✅" },
            { step: "6", label: "Unlock Next", icon: "🔓" },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-[#121214] border border-zinc-800 flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Step {item.step}</div>
                <div className="text-white font-semibold">{item.label}</div>
              </div>
              {idx < arr.length - 1 && (
                <ArrowRight className="w-4 h-4 text-zinc-700 mt-4 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white mb-2">
            Everything in One Place
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition"
            >
              <div className={`w-10 h-10 rounded-xl border ${f.bg} ${f.color} flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-bold font-mono text-white mb-2">{f.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 max-w-2xl mx-auto w-full px-4 sm:px-6 pb-20 text-center">
        <div className="bg-gradient-to-br from-[#121214] to-[#16161a] border border-cyan-800/30 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white mb-3">
            Ready to start?
          </h2>
          <p className="text-sm text-zinc-400 mb-8 font-sans">
            Create a free account and begin your first course in under a minute.
          </p>
          <Link href="/register">
            <button className="px-10 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold rounded-2xl text-sm transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.25)] cursor-pointer">
              Create Free Account →
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}

// ──────────────────────────────────────────
// AUTHENTICATED DASHBOARD
// ──────────────────────────────────────────
function AuthenticatedDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCourse, setCurrentCourse] = useState<ICourse | null>(null);
  const [currentModuleName, setCurrentModuleName] = useState<string>("");
  const [currentLessonName, setCurrentLessonName] = useState<string>("");
  const [currentCourseProgress, setCurrentCourseProgress] = useState<number>(0);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch("/api/user/progress");
        if (!res.ok) throw new Error("Failed to fetch progress");
        const data = await res.json();
        const prog: UserProgress = data.progress;
        setProgress(prog);

        // Resolve current course/module/lesson names
        if (prog.currentCourseId) {
          const rawCourse = getCourseById(prog.currentCourseId);
          if (rawCourse) {
            const decorated = getDecoratedCourse(rawCourse, {
              completedLessonIds: prog.completedLessonIds,
              passedQuizIds: prog.passedQuizIds,
              currentCourseId: prog.currentCourseId,
              currentModuleId: prog.currentModuleId,
              currentLessonId: prog.currentLessonId,
              enrolledCourseIds: prog.enrolledCourseIds,
              completedModuleIds: prog.completedModuleIds,
            });
            setCurrentCourse(decorated);
            setCurrentCourseProgress(decorated.progressPercent || 0);

            const mod = decorated.modules.find(
              (m) => m.moduleId === prog.currentModuleId
            ) || decorated.modules[0];
            if (mod) {
              setCurrentModuleName(mod.title);
              const les = mod.lessons.find(
                (l) => l.lessonId === prog.currentLessonId
              ) || mod.lessons[0];
              if (les) setCurrentLessonName(les.title);
            }
          }
        }
      } catch (e) {
        setError("Could not load your progress. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [userId]);

  const displayName =
    session?.user?.displayName || session?.user?.username || "Learner";

  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col selection:bg-cyan-500/30 overflow-x-hidden">
        <ConstellationField />
        <GlowHorizonFM variant="top" className="opacity-40 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-cyan-500/40 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-zinc-400 font-mono">Loading your dashboard…</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col selection:bg-cyan-500/30 overflow-x-hidden">
        <ConstellationField />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-rose-400 font-mono text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs rounded-xl cursor-pointer hover:bg-zinc-800 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const xp = progress?.xp ?? 0;
  const streak = progress?.currentStreak ?? 0;
  const longestStreak = progress?.longestStreak ?? 0;
  const levelInfo = calculateLevelFromXp(xp);
  const hasStartedCourse = !!progress?.currentCourseId && !!currentCourse;
  const dailyMissionGoal = 3;
  const dailyMissionCurrent = progress?.dailyMissionCurrent ?? 0;
  const dailyMissionCompleted = progress?.dailyMissionCompleted ?? false;
  const dailyMissionPercent = Math.min(
    Math.round((dailyMissionCurrent / dailyMissionGoal) * 100),
    100
  );

  const currentCourseId = progress?.currentCourseId || "";
  const currentModuleId = progress?.currentModuleId || "";
  const currentLessonId = progress?.currentLessonId || "";

  return (
    <main className="relative min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col selection:bg-cyan-500/30 overflow-x-hidden">
      <ConstellationField />
      <GlowHorizonFM variant="top" className="opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Learner Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
              {hasStartedCourse
                ? "Pick up right where you left off."
                : "Start your first course to begin your journey."}
            </p>
          </div>

          <Link href="/onboarding">
            <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono text-zinc-300 hover:text-white transition flex items-center gap-2 cursor-pointer">
              <span>Change Learning Track</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </Link>
        </div>

        {/* ── CONTINUE LEARNING / NO COURSE YET ── */}
        <section aria-label="Continue Learning">
          {hasStartedCourse ? (
            <div className="bg-gradient-to-br from-[#121214] via-[#16161a] to-[#121214] border-2 border-cyan-500/30 hover:border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{currentCourse?.icon || "📚"}</span>
                    <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-semibold">
                      {currentCourse?.title}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {currentLessonName || "Continue Learning"}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans leading-relaxed">
                      Module:{" "}
                      <strong className="text-zinc-200">{currentModuleName}</strong>
                      {". Complete the lesson to advance."}
                    </p>
                  </div>

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
                      View Course Map
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ── EMPTY STATE: No course started ── */
            <div className="bg-gradient-to-br from-[#121214] via-[#16161a] to-[#121214] border-2 border-dashed border-zinc-700/60 rounded-3xl p-10 sm:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-3xl mx-auto mb-6">
                🚀
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mb-3">
                Ready to start learning?
              </h2>
              <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto font-sans leading-relaxed">
                Choose a programming language and experience level to begin your
                first structured course.
              </p>
              <Link href="/onboarding">
                <button className="px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold rounded-2xl text-sm transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.25)] cursor-pointer">
                  Choose Your First Course →
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* ── METRICS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Mission */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Daily Mission</span>
                </div>
                {dailyMissionCompleted && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
                    Complete ✓
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold font-mono text-white mb-1">
                Complete {dailyMissionGoal} Lessons Today
              </h4>
              <p className="text-xs text-zinc-400">
                {dailyMissionCurrent}/{dailyMissionGoal} lessons completed
              </p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-500 text-[11px]">Mission Progress</span>
                <span className={`font-bold ${dailyMissionCompleted ? "text-emerald-400" : "text-indigo-400"}`}>
                  {dailyMissionPercent}%
                </span>
              </div>
              <div className="w-full bg-zinc-800/90 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${dailyMissionCompleted ? "bg-emerald-400" : "bg-indigo-400"}`}
                  style={{ width: `${dailyMissionPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* XP & Level */}
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
              {xp > 0 ? (
                <>
                  <h4 className="text-xl font-bold font-mono text-white mb-1">
                    {xp} <span className="text-xs text-zinc-400 font-sans font-normal">total XP</span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {levelInfo.xpForNextLevel - levelInfo.xpInCurrentLevel} XP until Level {levelInfo.level + 1}
                  </p>
                </>
              ) : (
                <p className="text-xs text-zinc-500 mt-2">
                  Complete lessons to earn XP and level up.
                </p>
              )}
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

          {/* Streak */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Streak Status</span>
                </div>
                {streak > 0 && (
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </div>
              {streak > 0 ? (
                <>
                  <h4 className="text-xl font-bold font-mono text-white mb-1">
                    {streak} <span className="text-xs text-zinc-400 font-sans font-normal">Day Streak</span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Longest streak: <strong className="text-zinc-200">{longestStreak} days</strong>
                  </p>
                </>
              ) : (
                <p className="text-xs text-zinc-500 mt-2">
                  Complete a lesson today to start your streak.
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-800/60">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-zinc-500">{day}</span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                      idx < streak
                        ? "bg-amber-400 text-black font-bold shadow-sm shadow-amber-500/20"
                        : "bg-zinc-800 text-zinc-600"
                    }`}
                  >
                    {idx < streak ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── EXPLORE LEARNING MODES ── */}
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
            <Link href="/detective" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-indigo-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/50 border border-indigo-800/40 text-indigo-400 flex items-center justify-center mb-3">
                    <Search className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-indigo-400 transition">Code Detective</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Investigate server logs, inspect clues, and diagnose production incidents.</p>
                </div>
                <span className="text-[11px] font-mono text-indigo-400 mt-3 block font-semibold">Open Case Files →</span>
              </div>
            </Link>

            <Link href="/architect" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-cyan-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mb-3">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-cyan-400 transition">Code Architect</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Build multi-phase data structures and production systems step-by-step.</p>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 mt-3 block font-semibold">Build Systems →</span>
              </div>
            </Link>

            <Link href="/problems" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-amber-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-950/50 border border-amber-800/40 text-amber-400 flex items-center justify-center mb-3">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-amber-400 transition">Practice Arena</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Solve targeted algorithmic coding problems across 5 programming languages.</p>
                </div>
                <span className="text-[11px] font-mono text-amber-400 mt-3 block font-semibold">Solve Challenges →</span>
              </div>
            </Link>

            <Link href="/duel" className="group">
              <div className="bg-[#121214] border border-zinc-800 group-hover:border-rose-500/40 rounded-2xl p-5 transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-rose-950/50 border border-rose-800/40 text-rose-400 flex items-center justify-center mb-3">
                    <Swords className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white group-hover:text-rose-400 transition">1v1 Live Duels</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Real-time head-to-head coding matches refereed by an AI judge.</p>
                </div>
                <span className="text-[11px] font-mono text-rose-400 mt-3 block font-semibold">Enter Duel Arena →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── ACHIEVEMENTS & STUDIO ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/80">
          {/* Achievements Preview */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold font-mono text-white">Achievements</h4>
              </div>
              <Link href="/achievements" className="text-xs font-mono text-cyan-400 hover:underline">
                View All →
              </Link>
            </div>
            {/* Empty state until real achievements load */}
            <div className="text-center py-6 text-zinc-500">
              <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-mono">Complete lessons and missions to unlock achievements.</p>
            </div>
          </div>

          {/* Studio CTA */}
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
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your personal sandbox workspace to write, execute, save, and share projects across multiple languages.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">Course Certificates</span>
              <Link href="/certificates" className="text-xs font-mono text-emerald-400 hover:underline">
                View Certificates →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────
// ROOT PAGE — AUTH GATE
// ──────────────────────────────────────────
export default function RootPage() {
  const { data: session, status } = useSession();

  // Loading auth state
  if (status === "loading") {
    return (
      <main className="relative min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex items-center justify-center">
        <ConstellationField />
        <div className="relative z-10 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-cyan-500/40 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-mono">Loading…</p>
        </div>
      </main>
    );
  }

  // Authenticated — show real dashboard
  if (session?.user?.id) {
    return <AuthenticatedDashboard userId={session.user.id} />;
  }

  // Unauthenticated — show hero/landing
  return <HeroLandingPage />;
}
