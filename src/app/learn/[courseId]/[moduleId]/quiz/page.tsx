"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Lock, BookOpen } from "lucide-react";
import { getCourseById } from "@/data/courses";
import { fetchUserProgress } from "@/services/courseService";
import { ICourse, ICourseModule } from "@/types/learning";
import ModuleQuizRunner from "@/components/ModuleQuizRunner";
import { LoadingState, ErrorState } from "@/components/StatusState";
import { QuizSkeleton } from "@/components/Skeletons";

export default function ModuleQuizPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const moduleId = typeof params.moduleId === "string" ? params.moduleId : "";

  const [course, setCourse] = useState<ICourse | null>(null);
  const [currentModule, setCurrentModule] = useState<ICourseModule | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !moduleId) return;

    async function loadQuiz() {
      const c = getCourseById(courseId);
      const m = c?.modules.find((mod) => mod.moduleId === moduleId);

      if (c && m) {
        setCourse(c);
        setCurrentModule(m);

        const progress = await fetchUserProgress();
        // Quiz is accessible if all lessons in module are complete OR if already previously completed
        const allLessonsDone = m.lessons.every((l) => progress?.completedLessonIds?.includes(l.lessonId));
        const previouslyPassed = progress?.passedQuizIds?.includes(m.quiz.quizId) || false;
        setIsUnlocked(allLessonsDone || previouslyPassed);
      }
      setLoading(false);
    }
    loadQuiz();
  }, [courseId, moduleId]);

  if (loading) return <QuizSkeleton />;
  if (!course || !currentModule) return <ErrorState title="Quiz Not Found" />;

  // Find next module ID if available
  const currentModIdx = course.modules.findIndex((m) => m.moduleId === moduleId);
  const nextMod = course.modules[currentModIdx + 1];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full font-sans">
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/learn/${course.courseId}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {course.title}</span>
        </Link>

        <span className="text-xs font-mono text-zinc-500">
          Module Checkpoint {currentModule.order} of {course.modules.length}
        </span>
      </div>

      {!isUnlocked ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-10 text-center max-w-md mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-500 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-white">Quiz Checkpoint Locked</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Please complete all lessons in <strong className="text-white">{currentModule.title}</strong> before taking this module checkpoint quiz.
            </p>
          </div>
          <Link href={`/learn/${course.courseId}/${currentModule.moduleId}/${currentModule.lessons[0].lessonId}`}>
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer">
              Go to First Lesson →
            </button>
          </Link>
        </div>
      ) : (
        <ModuleQuizRunner
          quiz={currentModule.quiz}
          courseId={course.courseId}
          moduleId={currentModule.moduleId}
          moduleTitle={currentModule.title}
          nextModuleId={nextMod?.moduleId}
        />
      )}
    </div>
  );
}
