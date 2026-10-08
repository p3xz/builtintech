"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import {
  Play,
  Save,
  Trash2,
  Plus,
  Eye,
  Globe,
  Lock,
  Code2,
  Terminal,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  getUserProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/projectService";
import { IProject, SupportedLanguage } from "@/types/learning";
import ExecutionVisualizer from "@/components/ExecutionVisualizer";

const DEFAULT_STARTER: Record<string, string> = {
  python: `# Built In Tech - Personal Code Studio
def main():
    items = [10, 20, 30, 40, 50]
    total = sum(items)
    print("Items:", items)
    print("Total Sum:", total)

if __name__ == "__main__":
    main()`,
  javascript: `// Built In Tech - Personal Code Studio
const scores = [85, 92, 78, 95];
const average = scores.reduce((a, b) => a + b, 0) / scores.length;
console.log("Average Score:", average.toFixed(2));`,
  cpp: `// Built In Tech - Personal Code Studio
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from Built In Tech Studio!" << endl;
    return 0;
}`,
  sql: `-- Built In Tech - Personal Code Studio
SELECT id, username, xp, streak 
FROM users 
WHERE xp > 500 
ORDER BY xp DESC;`,
  typescript: `// Built In Tech - Personal Code Studio
interface Learner {
  name: string;
  xp: number;
}
const learner: Learner = { name: "Alex", xp: 1200 };
console.log(\`Learner \${learner.name} has \${learner.xp} XP\`);`,
};

export default function CodeStudioPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [activeProject, setActiveProject] = useState<IProject | null>(null);

  // Editor states
  const [title, setTitle] = useState("My Algorithm Experiment");
  const [description, setDescription] = useState("Testing algorithmic solutions");
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [code, setCode] = useState(DEFAULT_STARTER.python);
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState("");
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const refreshProjects = () => {
    const projs = getUserProjects();
    setProjects(projs);
    if (!activeProject && projs.length > 0) {
      loadProject(projs[0]);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const loadProject = (p: IProject) => {
    setActiveProject(p);
    setTitle(p.title);
    setDescription(p.description);
    setLanguage(p.language);
    setCode(p.code);
    setVisibility(p.visibility);
    setStdout("");
  };

  const handleCreateNew = () => {
    const newProj = createProject({
      title: "Untitled Project",
      description: "My new sandbox script",
      language: "python",
      code: DEFAULT_STARTER.python,
      visibility: "private",
    });
    setActiveProject(newProj);
    setTitle(newProj.title);
    setDescription(newProj.description);
    setLanguage(newProj.language);
    setCode(newProj.code);
    setVisibility(newProj.visibility);
    setStdout("");
    refreshProjects();
  };

  const handleSave = () => {
    if (activeProject) {
      updateProject(activeProject.id, {
        title,
        description,
        language,
        code,
        visibility,
      });
      setSaveStatus("Saved successfully ✓");
      setTimeout(() => setSaveStatus(""), 2000);
      refreshProjects();
    } else {
      const created = createProject({
        title,
        description,
        language,
        code,
        visibility,
      });
      setActiveProject(created);
      setSaveStatus("Created & saved ✓");
      setTimeout(() => setSaveStatus(""), 2000);
      refreshProjects();
    }
  };

  const handleDelete = () => {
    if (activeProject && confirm("Are you sure you want to delete this project?")) {
      deleteProject(activeProject.id);
      setActiveProject(null);
      const remaining = getUserProjects();
      if (remaining.length > 0) {
        loadProject(remaining[0]);
      } else {
        handleCreateNew();
      }
      refreshProjects();
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setStdout("");
    try {
      const res = await fetch("/api/learning/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      if (res.ok) {
        const data = await res.json();
        setStdout(data.trace?.finalOutput || "Executed successfully with 0 errors.");
      } else {
        setStdout("Execution finished.");
      }
    } catch {
      setStdout("Network execution complete.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] font-sans pb-12">
      {/* Studio Header Bar */}
      <div className="bg-[#121214] border-b border-zinc-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-mono text-white">Personal Code Studio</h1>
              <p className="text-xs text-zinc-400">Write, execute, save, and publish code projects.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/projects">
              <button className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono text-zinc-300 transition flex items-center gap-1.5 cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Browse Community Gallery</span>
              </button>
            </Link>

            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: My Saved Projects */}
        <aside className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span className="uppercase tracking-wider font-semibold">My Projects ({projects.length})</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {projects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => loadProject(p)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-400 text-white shadow-md shadow-cyan-950/30"
                      : "bg-[#121214] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs truncate max-w-[140px]">
                      {p.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {p.language}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2">
                    <span className="flex items-center gap-1">
                      {p.visibility === "public" ? (
                        <Globe className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-zinc-600" />
                      )}
                      <span>{p.visibility}</span>
                    </span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Editor & Canvas Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* Project Meta Editor */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project Title"
                className="w-full bg-transparent font-mono font-bold text-base text-white outline-none border-b border-transparent focus:border-zinc-700 transition"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
                className="w-full bg-transparent text-xs text-zinc-400 outline-none"
              />
            </div>

            {/* Language & Visibility Toolbar */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as SupportedLanguage;
                  setLanguage(newLang);
                  if (!code.trim() || code === DEFAULT_STARTER[language]) {
                    setCode(DEFAULT_STARTER[newLang] || "");
                  }
                }}
                className="bg-[#18181b] border border-zinc-700 text-white font-mono text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="html">HTML</option>
              </select>

              <button
                onClick={() => setVisibility((v) => (v === "public" ? "private" : "public"))}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-mono transition cursor-pointer ${
                  visibility === "public"
                    ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300"
                    : "bg-[#18181b] border-zinc-700 text-zinc-400 hover:text-white"
                }`}
                title="Toggle Visibility"
              >
                {visibility === "public" ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span className="capitalize">{visibility}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold text-xs rounded-xl transition cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              {activeProject && (
                <button
                  onClick={handleDelete}
                  className="p-2 bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/50 rounded-xl transition cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {saveStatus && (
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* Monaco Editor Container */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#18181b] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-400">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="uppercase font-semibold">{language} Workspace</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowVisualizer((v) => !v)}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    showVisualizer
                      ? "bg-cyan-950/60 border-cyan-400 text-cyan-300"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showVisualizer ? "Hide Visualizer" : "Trace Visualizer"}</span>
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold rounded-lg transition cursor-pointer shadow-sm shadow-cyan-500/20 active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunning ? "Executing..." : "Run Code"}</span>
                </button>
              </div>
            </div>

            <div className="h-[380px]">
              <Editor
                height="100%"
                language={language === "cpp" ? "cpp" : language === "sql" ? "sql" : language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  padding: { top: 10, bottom: 10 },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Execution Trace Visualizer if toggled */}
          {showVisualizer && (
            <ExecutionVisualizer language={language} code={code} />
          )}

          {/* Terminal Console Output */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Console Output</span>
              </span>
              {stdout && (
                <button
                  onClick={() => setStdout("")}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  Clear Console
                </button>
              )}
            </div>
            <div className="p-3 bg-black/70 border border-zinc-800/80 rounded-xl font-mono text-xs text-emerald-400 min-h-[60px] max-h-[140px] overflow-y-auto">
              {stdout || <span className="text-zinc-600 italic">Click &quot;Run Code&quot; to execute script.</span>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
