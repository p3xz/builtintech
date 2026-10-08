"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { ClientRoom, ClientPlayerState, PlayerStatus } from "@/types/room";
import { ClientProblem } from "@/data/problems";

export default function DuelRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawRoomCode = typeof params.roomCode === "string" ? params.roomCode : "";
  const roomCode = rawRoomCode.toUpperCase();

  const [playerName, setPlayerName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);

  const [room, setRoom] = useState<ClientRoom | null>(null);
  const [problem, setProblem] = useState<ClientProblem | null>(null);
  const [myCode, setMyCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<{
    testsPassed: number;
    totalTests: number;
    success: boolean;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

  const autoSubmittedRef = useRef(false);
  const myCodeRef = useRef(myCode);
  myCodeRef.current = myCode;

  // 1. Get player name on load
  useEffect(() => {
    const urlName = searchParams.get("name");
    const storedName = sessionStorage.getItem(`clashjudge_name_${roomCode}`) || sessionStorage.getItem("clashjudge_name");
    if (urlName && urlName.trim()) {
      setPlayerName(urlName.trim());
      sessionStorage.setItem(`clashjudge_name_${roomCode}`, urlName.trim());
    } else if (storedName && storedName.trim()) {
      setPlayerName(storedName.trim());
    } else {
      setIsNameModalOpen(true);
    }
  }, [roomCode, searchParams]);

  const handleSaveName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    sessionStorage.setItem(`clashjudge_name_${roomCode}`, trimmed);
    sessionStorage.setItem("clashjudge_name", trimmed);
    setIsNameModalOpen(false);
  };

  // 2. Fetch room state
  const fetchRoomState = useCallback(async () => {
    if (!roomCode) return;
    try {
      const url = playerName
        ? `/api/duel/${roomCode}?playerName=${encodeURIComponent(playerName)}`
        : `/api/duel/${roomCode}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: ClientRoom = await res.json();
        setRoom(data);

        // Fetch problem if not yet fetched
        if (data.problemId && !problem) {
          const probRes = await fetch(`/api/problems/${data.problemId}`);
          if (probRes.ok) {
            const probData: ClientProblem = await probRes.json();
            setProblem(probData);
          }
        }

        // Initialize my code from room if empty
        if (!myCodeRef.current && playerName) {
          const isP1 = data.player1?.name?.toLowerCase() === playerName.toLowerCase();
          const isP2 = data.player2?.name?.toLowerCase() === playerName.toLowerCase();
          if (isP1 && data.player1.code) {
            setMyCode(data.player1.code);
          } else if (isP2 && data.player2?.code) {
            setMyCode(data.player2.code);
          }
        }
      }
    } catch (err) {
      console.error("Failed to poll duel room:", err);
    }
  }, [roomCode, playerName, problem]);

  // 3. Polling loop every 2 seconds & auto-trigger judging on duel end
  const judgingTriggeredRef = useRef(false);

  useEffect(() => {
    fetchRoomState();
    const interval = setInterval(fetchRoomState, 2000);
    return () => clearInterval(interval);
  }, [fetchRoomState]);

  useEffect(() => {
    if (!room) return;
    const p1Done = room.player1.status === "SOLVED" || room.player1.status === "SUBMITTED";
    const p2Done = room.player2 && (room.player2.status === "SOLVED" || room.player2.status === "SUBMITTED");
    const timerExpired = Boolean(room.endsAt && Date.now() >= room.endsAt);

    if ((room.status === "FINISHED" || (p1Done && p2Done) || timerExpired) && room.status !== "WAITING") {
      if (!judgingTriggeredRef.current) {
        judgingTriggeredRef.current = true;
        // Call judge endpoint and navigate to result
        fetch(`/api/duel/${roomCode}/judge`, { method: "POST" })
          .catch((e) => console.error(e))
          .finally(() => {
            router.push(`/duel/${roomCode}/result`);
          });
      }
    }
  }, [room, roomCode, router]);

  // 4. Timer countdown calculation
  useEffect(() => {
    if (!room?.endsAt || room.status !== "ACTIVE") {
      if (room?.status === "FINISHED") setTimeLeftMs(0);
      else setTimeLeftMs(null);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, (room.endsAt || 0) - Date.now());
      setTimeLeftMs(diff);

      if (diff === 0 && !autoSubmittedRef.current && room.status === "ACTIVE") {
        autoSubmittedRef.current = true;
        handleAutoSubmit();
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [room?.endsAt, room?.status]);

  // Submit code handler
  const handleSubmit = async () => {
    if (!room || !playerName || isSubmitting) return;
    if (room.status !== "ACTIVE") return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/duel/${roomCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName,
          code: myCodeRef.current,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitResult({
          testsPassed: data.testsPassed,
          totalTests: data.totalTests,
          success: data.success,
        });
        fetchRoomState();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (room?.status === "ACTIVE" && playerName) {
      handleSubmit();
    }
  };

  const copyRoomLink = () => {
    const url = window.location.origin + `/duel/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Determine roles
  const isPlayer1 = room?.player1?.name?.toLowerCase() === playerName.toLowerCase();
  const isPlayer2 = room?.player2?.name?.toLowerCase() === playerName.toLowerCase();
  const myPlayerState = isPlayer1 ? room?.player1 : isPlayer2 ? room?.player2 : null;
  const opponentState = isPlayer1 ? room?.player2 : isPlayer2 ? room?.player1 : null;

  const isSolved = myPlayerState?.status === "SOLVED";
  const isFinished = room?.status === "FINISHED";
  const isEditorReadOnly = isSolved || isFinished || room?.status === "WAITING";

  const formatTimer = (ms: number | null) => {
    if (ms === null) return "--:--";
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getStatusBadge = (status?: PlayerStatus) => {
    switch (status) {
      case "SOLVED":
        return (
          <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            SOLVED
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            SUBMITTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            CODING
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex flex-col">
      {/* Player Name Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-2 font-mono text-cyan-400">Join Duel Room</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Enter your player nickname to participate in room <span className="font-mono text-white">{roomCode}</span>.
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. NeoCoder"
              autoFocus
              className="w-full bg-[#1a1a1e] border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-2.5 text-sm text-white mb-4 outline-none transition font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName(nameInput);
              }}
            />
            <button
              onClick={() => handleSaveName(nameInput)}
              disabled={!nameInput.trim()}
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg text-sm transition"
            >
              Enter Room
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-zinc-800 bg-[#121214] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold tracking-tight text-lg text-white">
            Clash<span className="text-cyan-400">Judge</span>
          </span>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md">
            <span className="text-xs text-zinc-500 font-mono">ROOM:</span>
            <span className="text-xs font-mono font-bold text-zinc-200 tracking-wider">
              {roomCode}
            </span>
          </div>
          {room?.difficulty && (
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                room.difficulty.toLowerCase() === "hard"
                  ? "bg-rose-950/40 text-rose-300 border-rose-800/60"
                  : room.difficulty.toLowerCase() === "medium"
                  ? "bg-amber-950/40 text-amber-300 border-amber-800/60"
                  : "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              }`}
            >
              {room.difficulty}
            </span>
          )}
        </div>


        {/* Center Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`font-mono text-2xl font-bold px-4 py-0.5 rounded-lg border ${
              timeLeftMs !== null && timeLeftMs <= 60000 && timeLeftMs > 0
                ? "bg-rose-950/40 text-rose-400 border-rose-800/60 animate-pulse"
                : "bg-zinc-900/80 text-zinc-200 border-zinc-800"
            }`}
          >
            {formatTimer(timeLeftMs)}
          </div>
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded border uppercase font-medium ${
              room?.status === "ACTIVE"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : room?.status === "WAITING"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            {room?.status || "LOADING"}
          </span>
        </div>

        {/* Right action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={copyRoomLink}
            className="text-xs font-mono px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-zinc-300 transition"
          >
            {copiedLink ? "✓ Link Copied" : "Copy Room Link"}
          </button>
        </div>
      </header>

      {/* Waiting Room Overlay if status === WAITING */}
      {room?.status === "WAITING" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#121214] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-mono text-zinc-100 mb-1">Waiting for Opponent</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Share the room code or link below. The 10-minute countdown starts automatically when player 2 joins.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest block mb-1">
                Room Code
              </span>
              <span className="text-4xl font-mono font-black text-cyan-400 tracking-widest">
                {roomCode}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={copyRoomLink}
                className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 rounded-lg text-sm transition"
              >
                {copiedLink ? "✓ Copied to Clipboard" : "Copy Invite Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Duel Interface */}
      {room && room.status !== "WAITING" && (
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left: Problem Statement Panel */}
          <div className="col-span-4 border-r border-zinc-800 bg-[#121214] p-5 overflow-y-auto flex flex-col">
            {problem ? (
              <>
                <h1 className="text-xl font-bold font-mono text-zinc-100 mb-3">
                  {problem.title}
                </h1>
                <div className="prose prose-invert prose-sm text-zinc-300 leading-relaxed space-y-4 mb-6 whitespace-pre-wrap font-sans text-sm">
                  {problem.statement}
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800/80">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 font-semibold">
                    Examples
                  </h3>
                  <div className="space-y-3">
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-3 text-xs font-mono"
                      >
                        <div className="text-zinc-500 mb-1">Input:</div>
                        <pre className="text-zinc-200 bg-black/40 p-1.5 rounded mb-2 overflow-x-auto whitespace-pre-wrap">
                          {ex.input}
                        </pre>
                        <div className="text-zinc-500 mb-1">Output:</div>
                        <pre className="text-cyan-400 bg-black/40 p-1.5 rounded overflow-x-auto whitespace-pre-wrap">
                          {ex.output}
                        </pre>
                        {ex.explanation && (
                          <div className="text-zinc-400 mt-1.5 text-[11px] italic">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm font-mono">
                Loading problem description...
              </div>
            )}
          </div>

          {/* Right: Split Monaco Editors & Submission Controls */}
          <div className="col-span-8 flex flex-col bg-[#0a0a0b]">
            {/* Split Editors Container */}
            <div className="flex-1 grid grid-cols-2 gap-px bg-zinc-800 min-h-0">
              {/* Player 1 Editor (Cyan Theme) */}
              <div className="bg-[#0a0a0b] flex flex-col h-full overflow-hidden">
                <div className="h-10 px-4 bg-[#121214] border-b border-zinc-800 flex items-center justify-between border-t-2 border-t-[#22d3ee]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                    <span className="font-mono text-xs font-bold text-[#22d3ee]">
                      {room.player1?.name || "Player 1"}{" "}
                      {room.player1?.name?.toLowerCase() === playerName.toLowerCase() ? "(You)" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(room.player1?.status)}
                    <span className="text-[11px] font-mono text-zinc-400">
                      {room.player1 ? `${room.player1.testsPassed}/${room.player1.totalTests}` : "0/0"} tests
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  {room.player1?.name?.toLowerCase() === playerName.toLowerCase() ? (
                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={myCode}
                      onChange={(val) => setMyCode(val || "")}
                      options={{
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isEditorReadOnly,
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col">
                      {isFinished && room.player1.code ? (
                        <Editor
                          height="100%"
                          defaultLanguage="python"
                          theme="vs-dark"
                          value={room.player1.code}
                          options={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            minimap: { enabled: false },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            readOnly: true,
                          }}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs p-6 text-center">
                          <span className="mb-2">🔒 Opponent code hidden</span>
                          <span className="text-[11px] text-zinc-600">
                            Revealed when duel is finished
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Player 2 Editor (Rose Theme) */}
              <div className="bg-[#0a0a0b] flex flex-col h-full overflow-hidden">
                <div className="h-10 px-4 bg-[#121214] border-b border-zinc-800 flex items-center justify-between border-t-2 border-t-[#fb7185]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#fb7185]" />
                    <span className="font-mono text-xs font-bold text-[#fb7185]">
                      {room.player2?.name || "Player 2"}{" "}
                      {room.player2?.name?.toLowerCase() === playerName.toLowerCase() ? "(You)" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(room.player2?.status)}
                    <span className="text-[11px] font-mono text-zinc-400">
                      {room.player2 ? `${room.player2.testsPassed}/${room.player2.totalTests}` : "0/0"} tests
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  {room.player2?.name?.toLowerCase() === playerName.toLowerCase() ? (
                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={myCode}
                      onChange={(val) => setMyCode(val || "")}
                      options={{
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isEditorReadOnly,
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col">
                      {isFinished && room.player2?.code ? (
                        <Editor
                          height="100%"
                          defaultLanguage="python"
                          theme="vs-dark"
                          value={room.player2.code}
                          options={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            minimap: { enabled: false },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            readOnly: true,
                          }}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs p-6 text-center">
                          <span className="mb-2">🔒 Opponent code hidden</span>
                          <span className="text-[11px] text-zinc-600">
                            Revealed when duel is finished
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="h-16 border-t border-zinc-800 bg-[#121214] px-6 flex items-center justify-between">
              {/* Test Results Display */}
              <div className="flex items-center gap-3">
                {submitResult ? (
                  <div
                    className={`text-xs font-mono px-3 py-1.5 rounded-md border flex items-center gap-2 ${
                      submitResult.success
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : submitResult.testsPassed > 0
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    <span>
                      {submitResult.testsPassed}/{submitResult.totalTests} hidden tests passed
                    </span>
                    {submitResult.success && <span>🎉 (All Passed!)</span>}
                  </div>
                ) : myPlayerState ? (
                  <div className="text-xs font-mono text-zinc-400">
                    {myPlayerState.testsPassed > 0
                      ? `${myPlayerState.testsPassed}/${myPlayerState.totalTests} hidden tests passed`
                      : "Ready to submit"}
                  </div>
                ) : null}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isEditorReadOnly || room.status !== "ACTIVE"}
                  className="px-6 py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg text-sm transition font-mono flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : isSolved ? (
                    "✓ Solved"
                  ) : isFinished ? (
                    "Duel Finished"
                  ) : (
                    "Submit Solution"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
