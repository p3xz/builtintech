"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Code2,
  Swords,
  BarChart3,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Database,
  ArrowUpRight,
  Sparkles,
  Sliders,
  Terminal,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "problems" | "duels" | "system">("overview");

  // State
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [duels, setDuels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create problem modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [newDescription, setNewDescription] = useState("");
  const [newXp, setNewXp] = useState(100);
  const [newExamples, setNewExamples] = useState<{ input: string; output: string }[]>([
    { input: "", output: "" },
  ]);
  const [newHiddenTests, setNewHiddenTests] = useState<{ input: string; expectedOutput: string }[]>([
    { input: "", expectedOutput: "" },
  ]);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to load admin overview");
      }
    } catch {
      setErrorMsg("Network error loading overview");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetch("/api/admin/problems");
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDuels = async () => {
    try {
      const res = await fetch("/api/admin/duels");
      if (res.ok) {
        const data = await res.json();
        setDuels(data.duels || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      Promise.all([fetchOverview(), fetchUsers(), fetchProblems(), fetchDuels()]).finally(() => {
        setLoading(false);
      });
    }
  }, [status]);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleProblemPublish = async (problemId: number, currentPublished: boolean) => {
    try {
      const res = await fetch("/api/admin/problems", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, isPublished: !currentPublished }),
      });
      if (res.ok) {
        fetchProblems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          difficulty: newDifficulty,
          description: newDescription,
          xp: Number(newXp),
          examples: newExamples.filter((ex) => ex.input.trim() && ex.output.trim()),
          hiddenTestCases: newHiddenTests.filter((t) => t.input.trim() && t.expectedOutput.trim()),
          starterTemplates: {
            python: `def solve():\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
          },
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        fetchProblems();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create problem");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center font-mono text-xs text-zinc-500">
        Authenticating administrative session...
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#121214] border border-rose-900/50 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-950/40 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-mono text-white">Administrative Access Restricted</h1>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Your account ({session?.user?.username || "Guest"}) does not currently have administrative privileges.
          </p>
          <div className="pt-2">
            <Link href="/">
              <button className="px-5 py-2.5 bg-white text-black font-semibold text-xs font-mono rounded-lg transition cursor-pointer">
                Return to Arena →
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Admin Console</span>
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
            Platform Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-zinc-500">Operator:</span>
          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-cyan-400 font-bold">
            @{session.user.username}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl mb-8 font-mono text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "overview" ? "bg-[#1a1a1e] text-cyan-400 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "users" ? "bg-[#1a1a1e] text-cyan-400 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Users ({overview?.metrics?.totalUsers || 0})
        </button>
        <button
          onClick={() => setActiveTab("problems")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "problems" ? "bg-[#1a1a1e] text-cyan-400 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Code2 className="w-4 h-4" />
          Problems ({overview?.metrics?.totalProblems || 0})
        </button>
        <button
          onClick={() => setActiveTab("duels")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "duels" ? "bg-[#1a1a1e] text-cyan-400 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Swords className="w-4 h-4" />
          Duels ({overview?.metrics?.totalDuels || 0})
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "system" ? "bg-[#1a1a1e] text-cyan-400 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4" />
          System Health
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && overview && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Total Users</span>
              <div className="text-3xl font-bold font-mono text-white">{overview.metrics.totalUsers}</div>
            </div>
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Problems Catalog</span>
              <div className="text-3xl font-bold font-mono text-cyan-400">{overview.metrics.totalProblems}</div>
            </div>
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">1v1 Duels Fought</span>
              <div className="text-3xl font-bold font-mono text-rose-400">{overview.metrics.totalDuels}</div>
            </div>
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Submission Success</span>
              <div className="text-3xl font-bold font-mono text-emerald-400">{overview.metrics.successRate}%</div>
            </div>
          </div>

          {/* Quick Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Registrations */}
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Recent Registrations</span>
                <Users className="w-4 h-4 text-zinc-500" />
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {overview.recentUsers?.map((u: any) => (
                  <div key={u._id} className="p-3 bg-black/40 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{u.username}</div>
                      <div className="text-[11px] text-zinc-500">{u.email || "No email"}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === "admin" ? "bg-rose-950/40 text-rose-400 border border-rose-800/40" : "bg-zinc-800 text-zinc-400"}`}>
                        {u.role}
                      </span>
                      <div className="text-[11px] text-cyan-400 mt-1">{u.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Duels */}
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Recent 1v1 Duels</span>
                <Swords className="w-4 h-4 text-zinc-500" />
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {overview.recentDuels?.map((d: any) => (
                  <div key={d._id} className="p-3 bg-black/40 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-cyan-400">ROOM #{d.roomCode}</div>
                      <div className="text-[11px] text-zinc-400">
                        {d.player1?.username || "P1"} vs {d.player2?.username || "Waiting"}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-400">
                        {d.judgeResult?.winner ? `Winner: ${d.judgeResult.winner}` : d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                placeholder="Search by username or email..."
                className="w-full bg-[#121214] border border-zinc-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none pl-9"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs rounded-xl transition"
            >
              Search
            </button>
          </div>

          <div className="bg-[#121214] border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">XP</th>
                  <th className="p-4">Elo Rating</th>
                  <th className="p-4">Duel Record</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-900/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{u.username}</div>
                      <div className="text-[11px] text-zinc-500">{u.email || "—"}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          u.role === "admin"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-800/40 font-bold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-cyan-400">{u.xp} XP</td>
                    <td className="p-4 text-amber-400">{u.duelRating || 1000}</td>
                    <td className="p-4 text-zinc-300">
                      {u.duelsWon}W / {u.duelsLost}L ({u.duelsPlayed} played)
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleRole(u._id, u.role)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 transition"
                      >
                        {u.role === "admin" ? "Demote" : "Promote Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Problems Management */}
      {activeTab === "problems" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">
              Published Algorithm Problems ({problems.length})
            </span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              <Plus className="w-4 h-4" />
              Add Problem
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map((prob) => (
              <div key={prob._id} className="bg-[#121214] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-white">
                      #{prob.problemId} {prob.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        prob.difficulty === "Easy"
                          ? "text-emerald-400 border-emerald-800/40 bg-emerald-950/20"
                          : prob.difficulty === "Medium"
                          ? "text-amber-400 border-amber-800/40 bg-amber-950/20"
                          : "text-rose-400 border-rose-800/40 bg-rose-950/20"
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 font-sans leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 font-mono text-xs">
                  <span className="text-cyan-400">+{prob.xp} XP</span>
                  <button
                    onClick={() => handleToggleProblemPublish(prob.problemId, prob.isPublished)}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition ${
                      prob.isPublished ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {prob.isPublished ? "Published" : "Draft"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Duels Match Inspector */}
      {activeTab === "duels" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#121214] border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Room Code</th>
                  <th className="p-4">Problem</th>
                  <th className="p-4">Player 1 (Cyan)</th>
                  <th className="p-4">Player 2 (Rose)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Winner</th>
                  <th className="p-4 text-right">Referee Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {duels.map((duel) => (
                  <tr key={duel._id} className="hover:bg-zinc-900/40 transition">
                    <td className="p-4 font-bold text-white">#{duel.roomCode}</td>
                    <td className="p-4 text-zinc-300">{duel.problemId}</td>
                    <td className="p-4 text-cyan-400">
                      {duel.player1?.username || "—"} ({duel.player1?.testsPassed || 0}/{duel.player1?.totalTests || 0})
                    </td>
                    <td className="p-4 text-rose-400">
                      {duel.player2?.username || "—"} ({duel.player2?.testsPassed || 0}/{duel.player2?.totalTests || 0})
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {duel.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {duel.judgeResult?.winner || duel.winner || "—"}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/duel/${duel.roomCode}/result`}>
                        <button className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[11px] transition inline-flex items-center gap-1">
                          Inspect <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: System Telemetry */}
      {activeTab === "system" && overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <Database className="w-4 h-4" />
              <span>Database Cluster</span>
            </div>
            <div className="text-xs text-zinc-300">{overview.systemStatus.database}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-2 border-t border-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
            </div>
          </div>

          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <Terminal className="w-4 h-4" />
              <span>Code Sandbox Engine</span>
            </div>
            <div className="text-xs text-zinc-300">{overview.systemStatus.compilerSandbox}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-2 border-t border-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> 35s Wall-Clock Watchdog Active
            </div>
          </div>

          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
              <Cpu className="w-4 h-4" />
              <span>AI Referee Engine</span>
            </div>
            <div className="text-xs text-zinc-300">{overview.systemStatus.aiReferee}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-2 border-t border-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> JSON Schema Enforcement Active
            </div>
          </div>
        </div>
      )}

      {/* Create Problem Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-white text-sm">Add New Algorithm Problem</span>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Problem Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Valid Parentheses"
                  required
                  className="w-full bg-[#1a1a1e] border border-zinc-700 rounded-lg p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-[#1a1a1e] border border-zinc-700 rounded-lg p-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">Awarded XP</label>
                  <input
                    type="number"
                    value={newXp}
                    onChange={(e) => setNewXp(Number(e.target.value))}
                    className="w-full bg-[#1a1a1e] border border-zinc-700 rounded-lg p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Problem statement, inputs, outputs..."
                  rows={4}
                  required
                  className="w-full bg-[#1a1a1e] border border-zinc-700 rounded-lg p-2.5 text-white outline-none font-sans text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg transition"
              >
                Publish Problem →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
