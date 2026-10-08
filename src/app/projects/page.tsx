"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Globe,
  Code2,
  Terminal,
  User,
  Eye,
  GitFork,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { IProject } from "@/types/learning";

export default function PublicProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [activeModalProject, setActiveModalProject] = useState<IProject | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (selectedLanguage !== "all") params.set("language", selectedLanguage);
        const res = await fetch(`/api/projects/public?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        } else {
          setProjects([]);
        }
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [search, selectedLanguage]);

  const handleForkToStudio = async (p: IProject) => {
    try {
      await fetch("/api/user/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${p.title} (Fork)`,
          description: `Forked from @${p.username}`,
          language: p.language,
          code: p.code,
          visibility: "private",
          tags: p.tags || [],
        }),
      });
    } catch {
      // Non-critical — still navigate
    }
    router.push("/studio");
  };


  const languagesList = [
    { id: "all", name: "All Languages" },
    { id: "python", name: "Python" },
    { id: "javascript", name: "JavaScript" },
    { id: "cpp", name: "C++" },
    { id: "typescript", name: "TypeScript" },
    { id: "sql", name: "SQL" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-semibold mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Community Gallery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Public Projects
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Browse, inspect, and fork open-source projects published by fellow learners.
          </p>
        </div>

        <Link href="/studio">
          <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-cyan-500/20">
            Create New in Studio →
          </button>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, tags, or authors..."
            className="w-full bg-[#121214] border border-zinc-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none pl-10"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#121214] border border-zinc-800 rounded-xl font-mono text-xs w-full sm:w-auto overflow-x-auto">
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

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500/40 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">Loading community projects…</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Globe className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold font-mono text-white">No public projects found</h3>
          <p className="text-xs text-zinc-400 mt-1">Try adjusting your search query or language filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#121214] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 font-semibold">
                    {proj.language}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                    <User className="w-3 h-3 text-zinc-400" />
                    <span>@{proj.username}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold font-mono text-white group-hover:text-cyan-400 transition mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                  {proj.description}
                </p>

                {/* Code Preview snippet */}
                <pre className="p-3 bg-[#0d0d0f] border border-zinc-800/80 rounded-xl font-mono text-[11px] text-zinc-400 overflow-hidden line-clamp-3 mb-4">
                  {proj.code}
                </pre>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveModalProject(proj)}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => handleForkToStudio(proj)}
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Fork to Studio</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Code Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-semibold">
                  {activeModalProject.language}
                </span>
                <h2 className="text-xl font-bold font-mono text-white mt-1">
                  {activeModalProject.title}
                </h2>
                <span className="text-xs font-mono text-zinc-400">
                  By @{activeModalProject.username} &bull; {new Date(activeModalProject.createdAt).toLocaleDateString()}
                </span>
              </div>

              <button
                onClick={() => setActiveModalProject(null)}
                className="text-zinc-400 hover:text-white font-mono text-sm px-3 py-1 bg-zinc-800 rounded-lg cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeModalProject.description}
            </p>

            <div className="flex-1 min-h-0 bg-[#0d0d0f] border border-zinc-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-cyan-200">
              <pre className="whitespace-pre-wrap">{activeModalProject.code}</pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleForkToStudio(activeModalProject)}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Fork to My Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
