"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Zap,
} from "lucide-react";
import { getCourseById } from "@/data/courses";
import { ICourse, ICourseModule } from "@/types/learning";
import { LoadingState, ErrorState } from "@/components/StatusState";

export default function ModuleCompletionPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const moduleId = typeof params.moduleId === "string" ? params.moduleId : "";

  const [course, setCourse] = useState<ICourse | null>(null);
  const [currentModule, setCurrentModule] = useState<ICourseModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !moduleId) return;
    const c = getCourseById(courseId);
    const m = c?.modules.find((mod) => mod.moduleId === moduleId);
    if (c && m) {
      setCourse(c);
      setCurrentModule(m);
    }
    setLoading(false);
  }, [courseId, moduleId]);

  if (loading) return <LoadingState message="Loading module summary..." />;
  if (!course || !currentModule) return <ErrorState title="Module Not Found" />;

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-16 px-4 flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30">
      <div className="max-w-2xl w-full bg-[#121214] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden space-y-8">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Trophy/Badge */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block">
            Module Finished
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-mono text-white">
            Module Complete ✓
          </h1>
          <p className="text-base text-zinc-300 max-w-md mx-auto">
            You've completed all lessons and activities in <strong className="text-white">{currentModule.title}</strong>.
          </p>
        </div>

        {/* Progress achieved recap */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl font-mono text-center">
            <span className="text-[11px] text-zinc-500 block uppercase">Lessons Mastered</span>
            <span className="text-xl font-bold text-white">{currentModule.lessons.length} / {currentModule.lessons.length}</span>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl font-mono text-center">
            <span className="text-[11px] text-zinc-500 block uppercase">Next Checkpoint</span>
            <span className="text-xl font-bold text-amber-400">Quiz Ready</span>
          </div>
        </div>

        {/* Transition prompt to Checkpoint Quiz */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 max-w-md mx-auto">
          <span className="font-bold block font-mono mb-0.5">Ready for the Checkpoint?</span>
          Take the {currentModule.quiz.title} to test your retention and unlock the next module.
        </div>

        {/* Primary Action Button */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/learn/${course.courseId}`} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-semibold rounded-xl transition cursor-pointer">
              Course Roadmap
            </button>
          </Link>

          <Link href={`/learn/${course.courseId}/${currentModule.moduleId}/quiz`} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95">
              <span>Take Module Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
