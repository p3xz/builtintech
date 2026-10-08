"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CountUp from "@/components/CountUp";
import Typewriter from "@/components/Typewriter";
import { JudgeResult, ClientRoom } from "@/types/room";

export default function DuelResultPage() {
  const params = useParams();
  const router = useRouter();
  const rawRoomCode = typeof params.roomCode === "string" ? params.roomCode : "";
  const roomCode = rawRoomCode.toUpperCase();

  const [room, setRoom] = useState<ClientRoom | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [isJudging, setIsJudging] = useState(true);
  const [showVerdict, setShowVerdict] = useState(false);
  const [showWinnerHeader, setShowWinnerHeader] = useState(false);

  const fetchOrTriggerJudging = useCallback(async () => {
    if (!roomCode) return;
    try {
      // 1. Check room status first
      const statusRes = await fetch(`/api/duel/${roomCode}`);
      if (!statusRes.ok) return;
      const roomData: ClientRoom = await statusRes.json();
      setRoom(roomData);

      if (roomData.judgeResult) {
        setJudgeResult(roomData.judgeResult);
        setIsJudging(false);
        return;
      }

      // 2. Trigger judging if duel ended
      const judgeRes = await fetch(`/api/duel/${roomCode}/judge`, {
        method: "POST",
      });
      if (judgeRes.ok) {
        const judgeData = await judgeRes.json();
        if (judgeData.judgeResult) {
          setJudgeResult(judgeData.judgeResult);
          setIsJudging(false);
        }
      }
    } catch (err) {
      console.error("Error fetching judging results:", err);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchOrTriggerJudging();
    const interval = setInterval(() => {
      if (!judgeResult) {
        fetchOrTriggerJudging();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [fetchOrTriggerJudging, judgeResult]);

  useEffect(() => {
    if (judgeResult) {
      const timer1 = setTimeout(() => setShowVerdict(true), 1200);
      const timer2 = setTimeout(() => setShowWinnerHeader(true), 400);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [judgeResult]);

  if (isJudging || !judgeResult) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#121214] border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h2 className="text-2xl font-bold font-mono text-zinc-100">
              AI Referee in Session
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Evaluating correctness, efficiency, and code craftsmanship...
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-xs font-mono animate-pulse">
              <span className="text-zinc-400">1. Hidden Test Authority</span>
              <span className="text-cyan-400 font-bold">Verifying</span>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-xs font-mono animate-pulse delay-75">
              <span className="text-zinc-400">2. Performance Probe</span>
              <span className="text-purple-400 font-bold">Profiling</span>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-xs font-mono animate-pulse delay-150">
              <span className="text-zinc-400">3. AI Readability & Coaching</span>
              <span className="text-rose-400 font-bold">Scoring</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const p1 = judgeResult.player1;
  const p2 = judgeResult.player2;
  const winner = judgeResult.winner;

  const isP1Winner = winner === p1.name;
  const isP2Winner = winner === p2.name;
  const isTie = !winner;

  const winnerColorClass = isP1Winner
    ? "text-cyan-400"
    : isP2Winner
    ? "text-rose-400"
    : "text-amber-400";

  const glowClass = isP1Winner
    ? "glow-cyan-strong"
    : isP2Winner
    ? "glow-rose-strong"
    : "";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col p-6 sm:p-10 max-w-5xl mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold tracking-tight text-xl text-white">
            Clash<span className="text-cyan-400">Judge</span>
          </span>
          <span className="text-xs font-mono text-zinc-500 uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
            ROOM {roomCode}
          </span>
        </div>
        <Link href="/">
          <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono rounded-lg transition">
            ← Back to Lobby
          </button>
        </Link>
      </header>

      {/* Winner Announcement Header */}
      <div className={`text-center mb-10 transition-all duration-700 ${showWinnerHeader ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2 font-semibold">
          Official Verdict
        </span>
        <h1 className={`text-5xl sm:text-6xl font-bold font-mono tracking-tight mb-3 ${winnerColorClass}`}>
          {isTie ? "DRAW — NO WINNER" : `${winner} WINS`}
        </h1>
        <p className="text-sm font-mono text-zinc-400">
          {isTie
            ? "Both coders matched equally in tests, efficiency, and craft."
            : `Winner decided by referee decision.`}
        </p>
      </div>

      {/* Three Comparison Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 1. Correctness Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-semibold uppercase text-zinc-400">
              01. Correctness
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Hidden Tests</span>
          </div>
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-zinc-800/80 my-2">
            <div className="text-center">
              <span className="text-xs font-mono text-cyan-400 block mb-1 truncate">{p1.name}</span>
              <div className="text-2xl font-mono font-bold text-white">
                <CountUp end={p1.testsPassed} />/{p1.totalTests}
              </div>
            </div>
            <div className="text-center border-l border-zinc-800/80">
              <span className="text-xs font-mono text-rose-400 block mb-1 truncate">{p2.name}</span>
              <div className="text-2xl font-mono font-bold text-white">
                <CountUp end={p2.testsPassed} />/{p2.totalTests}
              </div>
            </div>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 text-center mt-2">
            Higher test pass rate takes priority
          </p>
        </div>

        {/* 2. Efficiency Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-semibold uppercase text-zinc-400">
              02. Efficiency
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Wall-Clock</span>
          </div>
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-zinc-800/80 my-2">
            <div className="text-center">
              <span className="text-xs font-mono text-cyan-400 block mb-1 truncate">{p1.name}</span>
              <div className="text-2xl font-mono font-bold text-white">
                {(p1.runtimeMs / 1000).toFixed(2)}s
              </div>
            </div>
            <div className="text-center border-l border-zinc-800/80">
              <span className="text-xs font-mono text-rose-400 block mb-1 truncate">{p2.name}</span>
              <div className="text-2xl font-mono font-bold text-white">
                {(p2.runtimeMs / 1000).toFixed(2)}s
              </div>
            </div>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 text-center mt-2">
            Tested against heaviest probe input
          </p>
        </div>

        {/* 3. Readability Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-semibold uppercase text-zinc-400">
              03. Readability
            </span>
            <span className="text-[10px] font-mono text-zinc-500">AI Scored</span>
          </div>
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-zinc-800/80 my-2">
            <div className="text-center">
              <span className="text-xs font-mono text-cyan-400 block mb-1 truncate">{p1.name}</span>
              <div className="text-2xl font-mono font-bold text-white">
                <CountUp end={p1.readability.score} />/10
              </div>
            </div>
            <div className="text-center border-l border-zinc-800/80">
              <span className="text-xs font-mono text-rose-400 block mb-1 truncate">{p2.name}</span>
              <div className="text-2xl font-mono font-bold text-white">
                <CountUp end={p2.readability.score} />/10
              </div>
            </div>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 text-center mt-2">
            Evaluated by AI code referee
          </p>
        </div>
      </div>

      {/* Ringside Verdict Commentary */}
      <div className={`bg-[#121214] border border-zinc-800 rounded-2xl p-6 sm:p-8 mb-8 ${glowClass}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Ringside Commentator Verdict
          </span>
        </div>
        <div className="text-base sm:text-lg font-mono text-zinc-200 leading-relaxed whitespace-pre-line italic">
          {showVerdict ? (
            <Typewriter text={judgeResult.verdict} speed={25} />
          ) : (
            <span className="text-zinc-600">Composing ringside commentary...</span>
          )}
        </div>
      </div>

      {/* Per-Player Coaching & Feedback Panels */}
      <div className="space-y-4 mb-10">
        <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
          Per-Player Post-Duel Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 Coaching Card */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 border-t-2 border-t-[#22d3ee]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono font-bold text-cyan-400 text-base">{p1.name}</span>
              <span className="text-xs font-mono text-zinc-500">
                Readability: {p1.readability.score}/10
              </span>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="font-mono text-rose-400 font-semibold uppercase text-[11px] block mb-1.5">
                  Where you went wrong
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  {p1.feedback.mistakes.map((m, idx) => (
                    <li key={idx} className="leading-relaxed">{m}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-amber-400 font-semibold uppercase text-[11px] block mb-1.5">
                  How to improve
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  {p1.feedback.improvements.map((imp, idx) => (
                    <li key={idx} className="leading-relaxed">{imp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <span className="font-mono text-emerald-400 font-semibold uppercase text-[11px] block mb-1.5">
                  The better approach
                </span>
                <p className="text-zinc-300 leading-relaxed font-sans">
                  {p1.feedback.betterApproach}
                </p>
              </div>
            </div>
          </div>

          {/* Player 2 Coaching Card */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 border-t-2 border-t-[#fb7185]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono font-bold text-rose-400 text-base">{p2.name}</span>
              <span className="text-xs font-mono text-zinc-500">
                Readability: {p2.readability.score}/10
              </span>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="font-mono text-rose-400 font-semibold uppercase text-[11px] block mb-1.5">
                  Where you went wrong
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  {p2.feedback.mistakes.map((m, idx) => (
                    <li key={idx} className="leading-relaxed">{m}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-amber-400 font-semibold uppercase text-[11px] block mb-1.5">
                  How to improve
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  {p2.feedback.improvements.map((imp, idx) => (
                    <li key={idx} className="leading-relaxed">{imp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <span className="font-mono text-emerald-400 font-semibold uppercase text-[11px] block mb-1.5">
                  The better approach
                </span>
                <p className="text-zinc-300 leading-relaxed font-sans">
                  {p2.feedback.betterApproach}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 pb-12 border-t border-zinc-800">
        <Link href="/duel" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs font-mono transition cursor-pointer shadow-lg shadow-cyan-500/20">
            ⚔️ Play Again
          </button>
        </Link>
        <Link href="/leaderboard" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs font-mono transition cursor-pointer">
            🏆 Leaderboard
          </button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs font-mono transition cursor-pointer">
            ← Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
