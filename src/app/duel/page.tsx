"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Swords, Code2, Users, Sparkles, ArrowRight, RefreshCw, KeyRound } from "lucide-react";

interface ProblemChoice {
  problemId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
}

export default function DuelHubPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [problems, setProblems] = useState<ProblemChoice[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");

  // Form states
  const [createNickname, setCreateNickname] = useState("");
  const [joinNickname, setJoinNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session?.user?.displayName || session?.user?.username) {
      const name = session.user.displayName || session.user.username;
      setCreateNickname(name);
      setJoinNickname(name);
    }
  }, [session]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/problems");
        if (res.ok) {
          const json = await res.json();
          setProblems(json.problems || []);
          if (json.problems?.length > 0) {
            setSelectedProblemId(json.problems[0].problemId);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblems();
  }, []);

  const handleCreateDuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createNickname.trim()) {
      setErrorMsg("Please enter your nickname");
      return;
    }
    if (!selectedProblemId) {
      setErrorMsg("Please select a problem");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/duel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: createNickname.trim(),
          problemId: selectedProblemId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem(`clashjudge_name_${data.roomCode}`, createNickname.trim());
        sessionStorage.setItem("clashjudge_name", createNickname.trim());
        router.push(`/duel/${data.roomCode}`);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to create duel");
      }
    } catch {
      setErrorMsg("Network error creating duel room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || roomCode.trim().length !== 6) {
      setErrorMsg("Please enter a valid 6-character room code");
      return;
    }
    if (!joinNickname.trim()) {
      setErrorMsg("Please enter your nickname");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const code = roomCode.trim().toUpperCase();

    try {
      const res = await fetch("/api/duel/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code,
          playerName: joinNickname.trim(),
        }),
      });

      if (res.ok) {
        sessionStorage.setItem(`clashjudge_name_${code}`, joinNickname.trim());
        sessionStorage.setItem("clashjudge_name", joinNickname.trim());
        router.push(`/duel/${code}`);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to join duel");
      }
    } catch {
      setErrorMsg("Network error joining duel room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-lg mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-950/40 to-rose-950/40 border border-zinc-800 text-zinc-300 text-xs font-mono mb-4">
          <Swords className="w-3.5 h-3.5 text-rose-400" />
          <span>Competitive 1v1 Arena</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white mb-3">
          1v1 Coding Duel
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Face an opponent on the exact same challenge. Ten minutes.
          Our AI referee scores correctness, efficiency, and code craftsmanship.
        </p>
      </div>

      {/* Main Duel Box */}
      <div className="w-full max-w-xl bg-[#121214] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-6 font-mono text-xs font-semibold">
          <button
            onClick={() => setActiveTab("create")}
            className={`py-2.5 rounded-lg transition ${
              activeTab === "create"
                ? "bg-[#1a1a1e] text-cyan-400 border border-cyan-500/20 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            CREATE DUEL (PLAYER 1)
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`py-2.5 rounded-lg transition ${
              activeTab === "join"
                ? "bg-[#1a1a1e] text-rose-400 border border-rose-500/20 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            JOIN DUEL (PLAYER 2)
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs font-mono text-rose-300 mb-6">
            {errorMsg}
          </div>
        )}

        {/* Create Duel Form */}
        {activeTab === "create" ? (
          <form onSubmit={handleCreateDuel} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                Your Nickname (Player 1)
              </label>
              <input
                type="text"
                value={createNickname}
                onChange={(e) => setCreateNickname(e.target.value)}
                placeholder="e.g. Cypher"
                required
                className="w-full bg-[#1a1a1e] border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm text-white font-mono outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                Select Problem for Duel
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {problems.map((p) => {
                  const isSelected = selectedProblemId === p.problemId;
                  return (
                    <div
                      key={p.problemId}
                      onClick={() => setSelectedProblemId(p.problemId)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between font-mono text-xs ${
                        isSelected
                          ? "bg-cyan-950/20 border-cyan-500/50 text-white"
                          : "bg-[#1a1a1e] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? "bg-cyan-400" : "bg-zinc-600"
                          }`}
                        />
                        <span className="font-bold text-white">#{p.problemId} {p.title}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                        {p.difficulty}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !createNickname.trim()}
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold font-mono py-3.5 rounded-lg text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating Room...
                </>
              ) : (
                "Create Duel Room →"
              )}
            </button>
          </form>
        ) : (
          /* Join Duel Form */
          <form onSubmit={handleJoinDuel} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                Room Code (6 Characters)
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. XK7Q2M"
                required
                className="w-full bg-[#1a1a1e] border border-zinc-700 focus:border-rose-400 rounded-lg px-4 py-3 text-xl text-center tracking-[0.4em] text-white font-mono font-bold uppercase outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                Your Nickname (Player 2)
              </label>
              <input
                type="text"
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                placeholder="e.g. Trinity"
                required
                className="w-full bg-[#1a1a1e] border border-zinc-700 focus:border-rose-400 rounded-lg px-4 py-3 text-sm text-white font-mono outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !roomCode.trim() || !joinNickname.trim()}
              className="w-full bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-semibold font-mono py-3.5 rounded-lg text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,113,133,0.2)]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Entering Duel...
                </>
              ) : (
                "Join Duel Showdown →"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
