"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles, BookOpen, Layers, Code2 } from "lucide-react";
import { SupportedLanguage, CourseLevel } from "@/types/learning";
import { saveOnboardingPreferences } from "@/services/progressService";

const SUPPORTED_LANGUAGES: Array<{
  id: SupportedLanguage;
  name: string;
  icon: string;
  desc: string;
}> = [
  { id: "python", name: "Python", icon: "🐍", desc: "Clean syntax, AI/ML, and automation" },
  { id: "javascript", name: "JavaScript", icon: "⚡", desc: "Full-stack web & async programming" },
  { id: "html", name: "HTML", icon: "🌐", desc: "Semantic markup & web structures" },
  { id: "css", name: "CSS", icon: "🎨", desc: "Modern styling, Flexbox & responsive layouts" },
  { id: "sql", name: "SQL", icon: "🗄️", desc: "Relational queries, joins & databases" },
  { id: "typescript", name: "TypeScript", icon: "🔷", desc: "Strict type systems & large-scale code" },
  { id: "java", name: "Java", icon: "☕", desc: "Object-oriented core & enterprise systems" },
  { id: "cpp", name: "C++", icon: "⚙️", desc: "High-performance systems & memory management" },
  { id: "c", name: "C", icon: "🔧", desc: "Low-level foundations & computer architecture" },
  { id: "csharp", name: "C#", icon: "🎯", desc: "Modern .NET, game dev & enterprise cloud" },
  { id: "php", name: "PHP", icon: "🐘", desc: "Modern server-side web backends" },
  { id: "swift", name: "Swift", icon: "🦅", desc: "iOS, macOS, and native Apple ecosystems" },
  { id: "ruby", name: "Ruby", icon: "💎", desc: "Developer ergonomics & web scripting" },
];

const EXPERIENCE_LEVELS: Array<{
  id: CourseLevel;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    id: "Beginner",
    title: "Beginner",
    description: "New to programming or starting fresh with this language.",
    icon: "🌱",
  },
  {
    id: "Intermediate",
    title: "Intermediate",
    description: "Comfortable with syntax; ready for data structures and clean patterns.",
    icon: "🚀",
  },
  {
    id: "Advanced",
    title: "Advanced",
    description: "Experienced coder focusing on systems architecture and optimization.",
    icon: "🏆",
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("python");
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>("Beginner");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const result = await saveOnboardingPreferences(selectedLanguage, selectedLevel);
      router.push(`/learn/${result.courseId}`);
    } catch {
      router.push("/learn");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-12 px-4 flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl w-full bg-[#121214] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs">
              {step}
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Step {step} of 2 — {step === 1 ? "Choose Language" : "Choose Experience"}
            </span>
          </div>

          <span className="text-xs font-mono text-zinc-500">
            {step === 1 ? "Personalize curriculum" : "Tune starting modules"}
          </span>
        </div>

        {/* STEP 1: Choose Language */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white mb-2">
                What do you want to learn?
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Select your primary language to start your structured learning path.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer font-sans ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/40"
                        : "bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{lang.icon}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-sm">{lang.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">{lang.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-xl active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Experience */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white mb-2">
                What is your experience level?
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                We'll tailor your starting lessons, practice problem difficulty, and module checkpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {EXPERIENCE_LEVELS.map((lvl) => {
                const isSelected = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/40"
                        : "bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{lvl.icon}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-xs font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-base text-white">{lvl.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{lvl.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs rounded-xl transition cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-mono font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? "Starting Course..." : "Start Learning Path →"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
