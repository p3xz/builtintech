"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, GraduationCap, Clock, Zap, BookOpen, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { getAllCourses } from "@/data/courses";
import { fetchUserProgress, getDecoratedCourse } from "@/services/courseService";
import { ICourse, SupportedLanguage, CourseLevel } from "@/types/learning";
import { LoadingState } from "@/components/StatusState";
import { CourseGridSkeleton } from "@/components/Skeletons";

export default function CoursesDirectoryPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  useEffect(() => {
    async function loadCourses() {
      const rawCourses = getAllCourses();
      const progress = await fetchUserProgress();
      const decorated = rawCourses.map((c) => getDecoratedCourse(c, progress));
      setCourses(decorated);
      setLoading(false);
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline.toLowerCase().includes(search.toLowerCase()) ||
      c.language.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLanguage === "all" || c.language === selectedLanguage;
    const matchesLevel = selectedLevel === "all" || c.level.toLowerCase() === selectedLevel.toLowerCase();
    return matchesSearch && matchesLang && matchesLevel;
  });

  const languagesList = [
    { id: "all", name: "All Languages" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C/C++" },
    { id: "c", name: "C" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Curriculum Tracks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Interactive Courses
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Structured modules with interactive lessons, hands-on practice, and checkpoint quizzes.
          </p>
        </div>

        {/* Quick Orientation Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl font-mono text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Available Tracks</span>
            <span className="text-lg font-bold text-white">{courses.length}</span>
          </div>
          <Link href="/onboarding">
            <button className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-cyan-500/20">
              Personalize Track →
            </button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses or topics..."
            className="w-full bg-[#121214] border border-zinc-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none pl-10"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121214] border border-zinc-800 rounded-xl font-mono text-xs w-full md:w-auto overflow-x-auto">
          {languagesList.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer shrink-0 ${
                selectedLanguage === lang.id
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <CourseGridSkeleton count={4} />
      ) : filteredCourses.length === 0 ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold font-mono text-white">No courses match your filter</h3>
          <p className="text-xs text-zinc-400 mt-1">Try resetting your search query or language filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isAvailable = course.isAvailable !== false && course.status !== "coming_soon";
            const hasStarted = isAvailable && (course.progressPercent || 0) > 0;
            return (
              <div
                key={course.id}
                className="bg-[#121214] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition group relative overflow-hidden"
              >
                {/* Top Banner Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${course.bannerGradient || "from-cyan-500 to-indigo-500"}`}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{course.icon}</span>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-semibold">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    {isAvailable ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full font-bold">
                        <Zap className="w-3 h-3" />
                        <span>+{course.totalXp} XP</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 rounded-full font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold font-mono text-white group-hover:text-cyan-400 transition mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {course.tagline}
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-400 font-mono mb-4 pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{course.modules.length} Modules</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>~{course.estimatedHours} Hours</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress & Card Action Footer */}
                <div className="pt-4 border-t border-zinc-800/80">
                  {hasStarted && (
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500 text-[11px]">Progress</span>
                        <span className="text-cyan-400 font-bold">{course.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link href={`/learn/${course.courseId}`} className="block">
                    {isAvailable ? (
                      <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 group-hover:bg-cyan-500 group-hover:text-black">
                        <span>{hasStarted ? "Continue Track" : "Start Course"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button className="w-full py-2.5 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono font-medium rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 border border-zinc-800">
                        <span>Coming Soon</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
