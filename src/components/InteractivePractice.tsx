"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Zap, Sparkles, AlertCircle } from "lucide-react";
import { IPracticeActivity } from "@/types/learning";

interface InteractivePracticeProps {
  activity: IPracticeActivity;
  onComplete: (awardedXp: number) => void;
}

export default function InteractivePractice({
  activity,
  onComplete,
}: InteractivePracticeProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textInput, setTextInput] = useState("");
  const [codeContent, setCodeContent] = useState(activity.starterCode || "");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [showHint, setShowHint] = useState(false);

  const handleReset = () => {
    setSelectedOption(null);
    setTextInput("");
    setCodeContent(activity.starterCode || "");
    setStatus("idle");
    setShowHint(false);
  };

  const handleCheck = () => {
    let isCorrect = false;

    if (activity.type === "multiple-choice" || activity.type === "output-prediction") {
      if (typeof activity.correctAnswer === "number") {
        isCorrect = selectedOption === activity.correctAnswer;
      } else if (typeof activity.correctAnswer === "string" && selectedOption !== null) {
        isCorrect = activity.options?.[selectedOption] === activity.correctAnswer;
      }
    } else if (activity.type === "fill-in-blank") {
      isCorrect = textInput.trim().toLowerCase() === String(activity.correctAnswer).trim().toLowerCase();
    } else if (activity.type === "debugging" || activity.type === "write-code") {
      // Basic normalization check or non-empty change
      const cleanCode = codeContent.replace(/\s+/g, " ").trim();
      const cleanSolution = (activity.solutionCode || "").replace(/\s+/g, " ").trim();
      isCorrect = cleanCode === cleanSolution || cleanCode.includes(cleanSolution) || (cleanCode.length > 5 && !cleanCode.includes("pass"));
    } else {
      isCorrect = true;
    }

    if (isCorrect) {
      setStatus("correct");
    } else {
      setStatus("incorrect");
    }
  };

  const handleContinue = () => {
    onComplete(activity.xp);
  };

  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col font-sans">
      {/* Activity Header */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 font-semibold">
            {activity.type.replace("-", " ")}
          </span>
          <h3 className="text-base font-bold text-white">{activity.title}</h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-2.5 py-1 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>+{activity.xp} XP</span>
        </div>
      </div>

      {/* Objective Prompt */}
      <div className="mb-6">
        <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold mb-1">
          What you need to do:
        </h4>
        <p className="text-sm text-zinc-200 leading-relaxed">{activity.instructions}</p>
      </div>

      {/* Interactive Activity Body based on Type */}
      <div className="mb-6">
        {/* 1. Multiple Choice & Output Prediction */}
        {(activity.type === "multiple-choice" || activity.type === "output-prediction") && activity.options && (
          <div className="space-y-2.5">
            {activity.starterCode && (
              <pre className="p-3.5 bg-[#0d0d0f] border border-zinc-800 rounded-xl font-mono text-xs text-cyan-300 mb-3 overflow-x-auto">
                {activity.starterCode}
              </pre>
            )}
            {activity.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = "bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700";

              if (isSelected) {
                if (status === "correct") btnClass = "bg-emerald-950/40 border-emerald-500 text-emerald-200";
                else if (status === "incorrect") btnClass = "bg-rose-950/40 border-rose-500 text-rose-200";
                else btnClass = "bg-cyan-950/40 border-cyan-400 text-cyan-200";
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedOption(idx);
                    if (status !== "idle") setStatus("idle");
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between font-mono text-xs cursor-pointer ${btnClass}`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-cyan-400 bg-cyan-400 text-black font-bold" : "border-zinc-700"
                    }`}
                  >
                    {isSelected && "✓"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Fill In The Blank */}
        {activity.type === "fill-in-blank" && (
          <div className="space-y-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Type your answer here..."
              className="w-full bg-[#18181b] border border-zinc-700 focus:border-cyan-400 rounded-xl p-3.5 font-mono text-sm text-white outline-none"
            />
          </div>
        )}

        {/* 3. Write Code & Debugging */}
        {(activity.type === "write-code" || activity.type === "debugging") && (
          <div className="space-y-2">
            <textarea
              rows={6}
              value={codeContent}
              onChange={(e) => {
                setCodeContent(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              className="w-full bg-[#0d0d0f] border border-zinc-700 focus:border-cyan-400 rounded-xl p-3.5 font-mono text-xs text-cyan-200 outline-none resize-y"
              placeholder="Write or fix code here..."
            />
          </div>
        )}
      </div>

      {/* Feedback Messages */}
      {status === "correct" && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 mb-5 text-xs text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-mono block text-sm">Correct! Great job.</span>
            <p className="mt-1 text-emerald-400/90">{activity.explanation}</p>
          </div>
        </div>
      )}

      {status === "incorrect" && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 mb-5 text-xs text-rose-300 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold font-mono block text-sm">Not quite right.</span>
            <p className="mt-1 text-rose-400/90">
              {activity.explanation || "Review the concept instructions and try again."}
            </p>
            {activity.conceptHint && (
              <p className="mt-2 text-zinc-400 italic">Hint: {activity.conceptHint}</p>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <div className="flex items-center gap-3">
          {status !== "correct" ? (
            <button
              onClick={handleCheck}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-semibold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-cyan-950/50 active:scale-95"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
