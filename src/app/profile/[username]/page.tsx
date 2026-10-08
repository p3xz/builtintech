"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Flame,
  Zap,
  Swords,
  Trophy,
  CheckCircle2,
  Calendar,
  Code2,
  ArrowLeft,
  Sparkles,
  Award,
  Globe,
  Terminal,
  Layers,
  Search,
} from "lucide-react";
import { getAllAchievements } from "@/data/achievements";
import { getUserCertificates } from "@/services/certificateService";
import { getUserProjects } from "@/services/projectService";
import { calculateLevelFromXp } from "@/services/progressService";
import { IAchievement, ICertificate, IProject } from "@/types/learning";

interface ProfileData {
  user: {
    id: string;
    username: string;
    displayName: string;
    image?: string;
    xp: number;
    currentStreak: number;
    longestStreak: number;
    solvedCount: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    duelRating: number;
    duelsPlayed: number;
    duelsWon: number;
    duelsLost: number;
    winRate: number;
    createdAt: string;
  };
  solvedQuestions: Array<{
    problemId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    xp: number;
    tags: string[];
  }>;
  recentSubmissions: Array<{
    _id: string;
    problemId: string;
    problemTitle: string;
    language: string;
    status: string;
    runtime: number;
    testsPassed: number;
    totalTests: number;
    awardedXp: number;
    createdAt: string;
  }>;
}

export default function UserProfilePage() {
  const params = useParams();
  const rawUsername = typeof params.username === "string" ? params.username : "";

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [achievements, setAchievements] = useState<IAchievement[]>([]);
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);

  useEffect(() => {
    if (!rawUsername) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(rawUsername)}`);
        if (res.ok) {
          const profileJson = await res.json();
          setData(profileJson);
        } else {
          // Fallback mock profile for demo guest
          setData({
            user: {
              id: "local-user",
              username: rawUsername,
              displayName: rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1),
              xp: 850,
              currentStreak: 4,
              longestStreak: 7,
              solvedCount: 8,
              totalSubmissions: 14,
              acceptedSubmissions: 10,
              acceptanceRate: 71,
              duelRating: 1100,
              duelsPlayed: 5,
              duelsWon: 4,
              duelsLost: 1,
              winRate: 80,
              createdAt: "2026-10-01T00:00:00Z",
            },
            solvedQuestions: [
              { problemId: "001", title: "Palindrome Number", difficulty: "Easy", xp: 50, tags: ["Math", "String"] },
              { problemId: "002", title: "FizzBuzz", difficulty: "Easy", xp: 50, tags: ["Math"] },
              { problemId: "003", title: "Two Sum", difficulty: "Easy", xp: 100, tags: ["Array"] },
            ],
            recentSubmissions: [],
          });
        }
      } catch {
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    setAchievements(getAllAchievements().filter((a) => a.unlocked));
    setCertificates(getUserCertificates());
    setProjects(getUserProjects());
  }, [rawUsername]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono text-xs">
        Loading learner profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-center p-6 space-y-4 font-mono">
        <h2 className="text-xl font-bold text-zinc-200">{error || "User Not Found"}</h2>
        <Link href="/">
          <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-xs">
            ← Return to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const { user, solvedQuestions } = data;
  const levelInfo = calculateLevelFromXp(user.xp);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full font-sans pb-16">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl sm:text-3xl font-mono font-bold text-cyan-400 shadow-xl">
              {user.displayName[0]?.toUpperCase() || user.username[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {user.displayName}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-bold">
                  Level {levelInfo.level}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">@{user.username}</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="flex items-center gap-3 font-mono">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center min-w-[80px]">
              <span className="text-[10px] text-zinc-500 uppercase block">XP</span>
              <span className="text-lg font-bold text-cyan-400">{user.xp}</span>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center min-w-[80px]">
              <span className="text-[10px] text-zinc-500 uppercase block">Streak</span>
              <span className="text-lg font-bold text-amber-400">🔥 {user.currentStreak}</span>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 text-center min-w-[80px]">
              <span className="text-[10px] text-zinc-500 uppercase block">Duels</span>
              <span className="text-lg font-bold text-rose-400">⚔️ {user.duelRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Languages & Learning Progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left: Languages Active & Completed */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-200 font-bold">
              Learning Languages
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs font-mono text-cyan-300 font-medium">
              🐍 Python (In Progress)
            </span>
            <span className="px-3 py-1 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs font-mono text-amber-300 font-medium">
              ⚡ JavaScript
            </span>
            <span className="px-3 py-1 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs font-mono text-indigo-300 font-medium">
              🗄️ SQL
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 text-xs font-mono text-zinc-400">
            <span>Longest Streak Record: <strong className="text-white">{user.longestStreak} days</strong></span>
          </div>
        </div>

        {/* Right: Practice Stats */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-200 font-bold">
              Practice Progression
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono py-2 bg-[#18181b] border border-zinc-800 rounded-xl">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Solved</span>
              <span className="text-base font-bold text-emerald-400">{user.solvedCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Submissions</span>
              <span className="text-base font-bold text-white">{user.totalSubmissions}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Accuracy</span>
              <span className="text-base font-bold text-cyan-400">{user.acceptanceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements & Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Achievements */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-200 font-bold">
                Unlocked Achievements ({achievements.length})
              </h2>
            </div>
            <Link href="/achievements" className="text-xs font-mono text-cyan-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2">
            {achievements.slice(0, 3).map((ach) => (
              <div key={ach.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center gap-3">
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <h4 className="text-xs font-mono font-bold text-white">{ach.title}</h4>
                  <p className="text-[11px] text-zinc-400">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-200 font-bold">
                Certificates ({certificates.length})
              </h2>
            </div>
            <Link href="/certificates" className="text-xs font-mono text-emerald-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2">
            {certificates.map((cert) => (
              <Link key={cert.id} href={`/certificates/${cert.id}`}>
                <div className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between transition">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white">{cert.courseTitle}</h4>
                    <span className="text-[10px] font-mono text-emerald-400">{cert.certificateId}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">View →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Public Projects Showcase */}
      {projects.length > 0 && (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-200 font-bold">
                Code Projects
              </h2>
            </div>
            <Link href="/studio" className="text-xs font-mono text-cyan-400 hover:underline">
              Open Studio →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((proj) => (
              <div key={proj.id} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 font-mono text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white truncate">{proj.title}</span>
                  <span className="text-[10px] text-cyan-400 uppercase bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-800/40">
                    {proj.language}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
