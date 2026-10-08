"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Award,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  Code2,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { getCourseById } from "@/data/courses";
import { fetchUserProgress, getDecoratedCourse } from "@/services/courseService";
import { ICourse, ICourseModule, ILesson } from "@/types/learning";
import { LoadingState, ErrorState } from "@/components/StatusState";
import { CourseOverviewSkeleton } from "@/components/Skeletons";

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.courseId === "string" ? params.courseId : "";

  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    async function loadCourse() {
      const rawCourse = getCourseById(courseId);
      if (!rawCourse) {
        setError("Course not found.");
        setLoading(false);
        return;
      }

      const progress = await fetchUserProgress();
      const decorated = getDecoratedCourse(rawCourse, progress);
      setCourse(decorated);
      setLoading(false);
    }
    loadCourse();
  }, [courseId]);

  if (loading) return <CourseOverviewSkeleton />;
  if (error || !course) return <ErrorState title="Course Not Found" message="We couldn't find this course curriculum." />;

  // Find next actionable lesson or module
  let firstIncompleteModule: ICourseModule | undefined = undefined;
  let firstIncompleteLesson: ILesson | undefined = undefined;

  for (const mod of course.modules) {
    if (!mod.isLocked && !mod.isCompleted) {
      firstIncompleteModule = mod;
      firstIncompleteLesson = mod.lessons.find((l) => !l.isCompleted) || mod.lessons[0];
      break;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-5xl mx-auto w-full font-sans">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* Course Header Banner */}
      <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-10">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${course.bannerGradient || "from-cyan-500 to-indigo-500"}`}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{course.icon}</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 font-semibold">
                  {course.level} Level
                </span>
                <span className="text-xs font-mono text-zinc-500 ml-2">
                  {course.modules.length} Modules &bull; ~{course.estimatedHours} Hours
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Quick Progress Box & Primary CTA */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 shrink-0 flex flex-col justify-between min-w-[240px]">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Total Progress</span>
                <span className="text-cyan-400 font-bold">{course.progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                <span>Earnable Reward</span>
                <span className="text-amber-400 font-bold">+{course.totalXp} XP</span>
              </div>
            </div>

            {firstIncompleteModule && firstIncompleteLesson ? (
              <Link
                href={`/learn/${course.courseId}/${firstIncompleteModule.moduleId}/${firstIncompleteLesson.lessonId}`}
              >
                <button className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                  <span>Continue Learning</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <Link href={`/learn/${course.courseId}/${course.modules[0].moduleId}/${course.modules[0].lessons[0].lessonId}`}>
                <button className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2">
                  <span>Start Module 1</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── COURSE ROADMAP: MODULES & LESSONS TREE ── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Course Modules & Checkpoints</span>
          </h2>
          <span className="text-xs font-mono text-zinc-400">
            Pass module checkpoints to unlock next stages
          </span>
        </div>

        <div className="space-y-6">
          {course.modules.map((mod, modIdx) => {
            const allLessonsCompleted = mod.lessons.every((l) => l.isCompleted);
            const isQuizUnlocked = !mod.isLocked && allLessonsCompleted;

            return (
              <div
                key={mod.id}
                className={`bg-[#121214] border rounded-2xl p-6 transition ${
                  mod.isLocked
                    ? "border-zinc-800/60 opacity-60 bg-zinc-950/40"
                    : mod.isCompleted
                    ? "border-emerald-500/40 bg-[#121214]"
                    : "border-cyan-500/30 shadow-lg shadow-cyan-950/20"
                }`}
              >
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        mod.isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : mod.isLocked
                          ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                          : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      }`}
                    >
                      {mod.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : mod.isLocked ? <Lock className="w-4 h-4" /> : modIdx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                          Module {mod.order}
                        </span>
                        {mod.isCompleted && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-bold">
                            Completed ✓
                          </span>
                        )}
                        {mod.isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-bold animate-pulse">
                            Current
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold font-mono text-white mt-0.5">{mod.title}</h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-zinc-500">
                    ~{mod.estimatedMinutes} Mins
                  </span>
                </div>

                {/* Lessons List in Module */}
                <div className="space-y-2.5 mb-5">
                  {mod.lessons.map((lesson, lesIdx) => (
                    <div
                      key={lesson.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        mod.isLocked
                          ? "bg-zinc-900/20 border-zinc-800/40 text-zinc-600 cursor-not-allowed"
                          : lesson.isCompleted
                          ? "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                          : "bg-[#18181b] border-cyan-500/30 text-white hover:border-cyan-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : mod.isLocked ? (
                          <Lock className="w-4 h-4 text-zinc-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                          </div>
                        )}

                        <div>
                          <span className="text-xs font-mono font-medium block">
                            {lesIdx + 1}. {lesson.title}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                            {lesson.summary}
                          </span>
                        </div>
                      </div>

                      {!mod.isLocked && (
                        <Link
                          href={`/learn/${course.courseId}/${mod.moduleId}/${lesson.lessonId}`}
                          className="shrink-0"
                        >
                          <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs rounded-lg transition cursor-pointer">
                            {lesson.isCompleted ? "Review" : "Learn"} →
                          </button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── MODULE CHECKPOINT QUIZ (Locked until lessons complete) ── */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    mod.isCompleted
                      ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                      : isQuizUnlocked
                      ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                      : "bg-zinc-900/30 border-zinc-800/60 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          Module Checkpoint Quiz: {mod.quiz.title}
                        </span>
                        {!isQuizUnlocked && !mod.isCompleted && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            (Complete all lessons to unlock)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {mod.quiz.questions.length} questions &bull; Pass with {mod.quiz.passingScorePercent}% &bull; +{mod.quiz.xpReward} XP
                      </p>
                    </div>
                  </div>

                  {isQuizUnlocked && !mod.isCompleted && (
                    <Link href={`/learn/${course.courseId}/${mod.moduleId}/quiz`}>
                      <button className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs rounded-lg transition cursor-pointer shadow-md">
                        Take Checkpoint Quiz →
                      </button>
                    </Link>
                  )}

                  {mod.isCompleted && (
                    <Link href={`/learn/${course.courseId}/${mod.moduleId}/quiz`}>
                      <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs rounded-lg transition cursor-pointer">
                        Retake Quiz
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
