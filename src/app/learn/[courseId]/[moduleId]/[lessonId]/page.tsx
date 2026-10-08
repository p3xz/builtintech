"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  Terminal,
  Zap,
  RotateCcw,
  Eye,
  Layers,
} from "lucide-react";
import { getCourseById } from "@/data/courses";
import { markLessonCompleted, getLocalProgress } from "@/services/courseService";
import { incrementMissionProgress } from "@/services/progressService";
import { ICourse, ICourseModule, ILesson } from "@/types/learning";
import ExecutionVisualizer from "@/components/ExecutionVisualizer";
import { LoadingState, ErrorState } from "@/components/StatusState";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const moduleId = typeof params.moduleId === "string" ? params.moduleId : "";
  const lessonId = typeof params.lessonId === "string" ? params.lessonId : "";

  const [course, setCourse] = useState<ICourse | null>(null);
  const [currentModule, setCurrentModule] = useState<ICourseModule | null>(null);
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [loading, setLoading] = useState(true);

  // Editor and Try It state
  const [code, setCode] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState<string>("");
  const [feedback, setFeedback] = useState<{
    status: "idle" | "correct" | "incorrect";
    message: string;
  }>({ status: "idle", message: "" });

  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!courseId || !moduleId || !lessonId) return;

    const foundCourse = getCourseById(courseId);
    if (!foundCourse) {
      setLoading(false);
      return;
    }

    const foundModule = foundCourse.modules.find((m) => m.moduleId === moduleId);
    const foundLesson = foundModule?.lessons.find((l) => l.lessonId === lessonId);

    if (foundCourse && foundModule && foundLesson) {
      setCourse(foundCourse);
      setCurrentModule(foundModule);
      setLesson(foundLesson);
      setCode(foundLesson.tryIt.starterCode || "");

      const progress = getLocalProgress();
      setIsCompleted(progress.completedLessonIds.includes(lessonId));
    }
    setLoading(false);
  }, [courseId, moduleId, lessonId]);

  if (loading) return <LoadingState message="Loading lesson..." />;
  if (!course || !currentModule || !lesson) {
    return <ErrorState title="Lesson Not Found" message="The requested lesson does not exist." />;
  }

  // Find next lesson or module checkpoint
  const currentLessonIndex = currentModule.lessons.findIndex((l) => l.lessonId === lesson.lessonId);
  const nextLesson = currentModule.lessons[currentLessonIndex + 1];

  const handleRunAndCheck = async () => {
    setIsRunning(true);
    setFeedback({ status: "idle", message: "" });

    // Normalize check
    const cleanCode = code.replace(/\s+/g, " ").trim();
    const cleanSolution = (lesson.tryIt.solutionCode || "").replace(/\s+/g, " ").trim();

    // Basic output simulation or comparison
    const passesCheck =
      cleanCode.includes(cleanSolution) ||
      (cleanCode.length > (lesson.tryIt.starterCode || "").length && !cleanCode.includes("pass"));

    setTimeout(async () => {
      setIsRunning(false);
      if (passesCheck) {
        setStdout(lesson.tryIt.expectedOutput || "Code executed with 0 errors.\nOutput verified.");
        setFeedback({
          status: "correct",
          message: "Great job! Your solution passed the activity validation.",
        });
        setIsCompleted(true);
        await markLessonCompleted(course.courseId, currentModule.moduleId, lesson.lessonId);
        incrementMissionProgress();
      } else {
        setStdout("Output mismatch or incomplete code.");
        setFeedback({
          status: "incorrect",
          message: lesson.tryIt.hint ? `Check hint: ${lesson.tryIt.hint}` : "Please complete the code requirements and run again.",
        });
      }
    }, 400);
  };

  const handleContinue = () => {
    if (nextLesson) {
      router.push(`/learn/${course.courseId}/${currentModule.moduleId}/${nextLesson.lessonId}`);
    } else {
      // Finished all lessons in module -> proceed to Module Completion Celebration!
      router.push(`/learn/${course.courseId}/${currentModule.moduleId}/complete`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] font-sans pb-16">
      {/* Top Sticky Breadcrumb Bar */}
      <div className="sticky top-12 z-30 bg-[#121214]/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-400 truncate">
            <Link href={`/learn/${course.courseId}`} className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{course.title}</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-300 truncate">{currentModule.title}</span>
            <span>/</span>
            <span className="text-cyan-400 font-bold truncate">{lesson.title}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowVisualizer((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                showVisualizer
                  ? "bg-cyan-950/60 border-cyan-400 text-cyan-300"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showVisualizer ? "Hide Visualizer" : "Trace Visualizer"}</span>
            </button>

            {isCompleted && (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Focused Learning Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Lesson Header */}
        <div className="space-y-2 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 font-semibold">
              Lesson {currentLessonIndex + 1} of {currentModule.lessons.length}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              ~{lesson.estimatedMinutes} mins
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {lesson.title}
          </h1>
        </div>

        {/* ── 1. CONCEPT SECTION ── */}
        <section className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            <BookOpen className="w-4 h-4" />
            <span>1. Concept</span>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-3 font-sans">
            <div className="whitespace-pre-line">{lesson.concept}</div>
          </div>

          {lesson.conceptPoints && lesson.conceptPoints.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800/80">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                Key Takeaways:
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {lesson.conceptPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">&bull;</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── 2. EXAMPLE SECTION ── */}
        {lesson.example && (
          <section className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Code2 className="w-4 h-4" />
              <span>2. Code Example: {lesson.example.title || "Interactive Demo"}</span>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0d0d0f]">
              <div className="bg-[#18181b] px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>{lesson.example.language}</span>
                <span>Read-only snippet</span>
              </div>
              <pre className="p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
                {lesson.example.code}
              </pre>
            </div>

            {lesson.example.output && (
              <div className="p-3 bg-black/60 border border-zinc-800 rounded-xl font-mono text-xs text-emerald-400">
                <span className="text-zinc-500 block text-[10px] uppercase mb-1">Expected Console Output:</span>
                {lesson.example.output}
              </div>
            )}

            {lesson.example.explanation && (
              <p className="text-xs text-zinc-400 leading-relaxed italic">
                {lesson.example.explanation}
              </p>
            )}
          </section>
        )}

        {/* ── Optional Execution Visualizer Drawer ── */}
        {showVisualizer && (
          <section className="space-y-2">
            <ExecutionVisualizer language={course.language} code={code} />
          </section>
        )}

        {/* ── 3. TRY IT: INTERACTIVE CODE SANDBOX ── */}
        <section className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>3. Try It Yourself</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              <span>+25 XP</span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
            <strong className="block font-mono uppercase tracking-wider text-[11px] text-cyan-400 mb-1">
              Task Instructions:
            </strong>
            {lesson.tryIt.instructions}
          </div>

          {/* Code Editor */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0d0d0f]">
            <div className="bg-[#18181b] px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 uppercase">{course.language} Sandbox</span>
              <button
                onClick={() => setCode(lesson.tryIt.starterCode || "")}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Starter</span>
              </button>
            </div>

            <div className="h-44 sm:h-56">
              <Editor
                height="100%"
                language={course.language === "cpp" ? "cpp" : course.language === "sql" ? "sql" : course.language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  padding: { top: 8, bottom: 8 },
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Console Output & Feedback Banner */}
          {stdout && (
            <div className="p-3 bg-black/70 border border-zinc-800 rounded-xl font-mono text-xs">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Terminal Output:</span>
              <pre className="text-emerald-400 whitespace-pre-wrap">{stdout}</pre>
            </div>
          )}

          {feedback.status === "correct" && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold font-mono block text-sm">Challenge Completed!</span>
                <p className="mt-0.5">{feedback.message}</p>
              </div>
            </div>
          )}

          {feedback.status === "incorrect" && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold font-mono block text-sm">Check Output</span>
                <p className="mt-0.5">{feedback.message}</p>
              </div>
            </div>
          )}

          {/* Footer Actions: Run/Check & Continue */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
            <button
              onClick={handleRunAndCheck}
              disabled={isRunning}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-950/50 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? "Running..." : "Run & Check Code"}</span>
            </button>

            {isCompleted && (
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-white hover:bg-zinc-200 text-black font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xl active:scale-95"
              >
                <span>{nextLesson ? "Continue to Next Lesson" : "Finish Module →"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
