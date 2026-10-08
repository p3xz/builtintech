"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, BookOpen, Clock, Compass } from "lucide-react";

interface CourseComingSoonProps {
  courseTitle?: string;
  language?: string;
  icon?: string;
}

export default function CourseComingSoon({
  courseTitle,
  language,
  icon,
}: CourseComingSoonProps) {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center px-4 py-12">
      <div className="relative max-w-xl w-full text-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 -top-16 bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>In Active Development</span>
        </div>

        {/* Icon & Title */}
        <div className="space-y-4 mb-8">
          {icon && (
            <div className="text-5xl mb-2 select-none">
              {icon}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Introducing more soon.
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed font-sans">
            We&apos;re building more courses and learning paths for Built In Tech. Check back soon.
          </p>
        </div>

        {/* Context Card */}
        {courseTitle && (
          <div className="mb-8 p-4 bg-[#121214] border border-zinc-800/80 rounded-2xl max-w-sm mx-auto text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Planned Track
              </div>
              <div className="text-sm font-mono font-semibold text-zinc-200 truncate">
                {courseTitle}
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50 shrink-0">
              Upcoming
            </span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
          <Link
            href="/learn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition shadow-lg shadow-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Learn</span>
          </Link>
          <Link
            href="/learn/python-fundamentals"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition cursor-pointer"
          >
            <span>Explore Python Track →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
