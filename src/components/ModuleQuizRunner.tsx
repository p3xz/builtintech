"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { IModuleQuiz } from "@/types/learning";
import { evaluateModuleQuiz } from "@/services/courseService";

interface ModuleQuizRunnerProps {
  quiz: IModuleQuiz;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  nextModuleId?: string;
}

export default function ModuleQuizRunner({
  quiz,
  courseId,
  moduleId,
  moduleTitle,
  nextModuleId,
}: ModuleQuizRunnerProps) {
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [quizResult, setQuizResult] = useState<{
    passed: boolean;
    scorePercent: number;
    correctCount: number;
    totalQuestions: number;
    xpAwarded: number;
    nextModuleId?: string;
  } | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (idx: number) => {
    if (hasSubmittedCurrent) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setHasSubmittedCurrent(true);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedOption,
    }));
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedCurrent(false);
    } else {
      // Finished all questions - evaluate quiz
      setIsSubmitting(true);
      const finalAnswers = {
        ...selectedAnswers,
        [currentQuestion.id]: selectedOption ?? 0,
      };

      const result = await evaluateModuleQuiz(courseId, moduleId, quiz.quizId, finalAnswers);
      setQuizResult(result);
      setQuizFinished(true);
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSelectedOption(null);
    setHasSubmittedCurrent(false);
    setQuizFinished(false);
    setQuizResult(null);
  };

  if (quizFinished && quizResult) {
    return (
      <div className="max-w-2xl mx-auto w-full bg-[#121214] border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
        {quizResult.passed ? (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                Checkpoint Cleared
              </span>
              <h2 className="text-3xl font-black font-mono text-white">Module Complete ✓</h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
                You scored <strong className="text-white">{quizResult.scorePercent}%</strong> ({quizResult.correctCount}/{quizResult.totalQuestions} questions correct).
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>+{quizResult.xpAwarded} XP Earned</span>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-center gap-4">
              {quizResult.nextModuleId || nextModuleId ? (
                <button
                  onClick={() => router.push(`/learn/${courseId}`)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-xl"
                >
                  <span>Continue to Next Module</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/learn/${courseId}`)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  Return to Course Overview
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                Needs Review
              </span>
              <h2 className="text-3xl font-black font-mono text-white">Review & Try Again</h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
                You scored <strong className="text-white">{quizResult.scorePercent}%</strong>. A passing score of {quiz.passingScorePercent}% is required to unlock the next module.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push(`/learn/${courseId}`)}
                className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Review Lessons
              </button>
              <button
                onClick={handleRetry}
                className="w-full sm:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuestion.correctIndex;

  return (
    <div className="max-w-2xl mx-auto w-full bg-[#121214] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl font-sans">
      {/* Quiz Top Navigation & Meta */}
      <div className="border-b border-zinc-800 pb-5 mb-6">
        <div className="flex items-center justify-between gap-4 text-xs font-mono mb-2">
          <span className="text-zinc-400 truncate font-medium">
            {moduleTitle} — <strong className="text-white">{quiz.title}</strong>
          </span>
          <span className="text-cyan-400 font-bold shrink-0">
            Question {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold font-mono text-white leading-snug">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          let optionStyle = "bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700";

          if (hasSubmittedCurrent) {
            if (idx === currentQuestion.correctIndex) {
              optionStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold";
            } else if (isSelected) {
              optionStyle = "bg-rose-950/40 border-rose-500 text-rose-200";
            }
          } else if (isSelected) {
            optionStyle = "bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-sm";
          }

          return (
            <button
              key={idx}
              disabled={hasSubmittedCurrent}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between font-mono text-xs sm:text-sm cursor-pointer ${optionStyle}`}
            >
              <span>{opt}</span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  hasSubmittedCurrent && idx === currentQuestion.correctIndex
                    ? "border-emerald-400 bg-emerald-400 text-black font-bold"
                    : isSelected
                    ? "border-cyan-400 bg-cyan-400 text-black font-bold"
                    : "border-zinc-700"
                }`}
              >
                {hasSubmittedCurrent && idx === currentQuestion.correctIndex ? "✓" : isSelected ? "✓" : ""}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation Banner on Submit */}
      {hasSubmittedCurrent && (
        <div
          className={`p-4 rounded-2xl border mb-6 text-xs sm:text-sm leading-relaxed ${
            isCorrect
              ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
              : "bg-rose-950/30 border-rose-900/50 text-rose-300"
          }`}
        >
          <div className="font-bold font-mono mb-1 flex items-center gap-1.5">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Concept Review:</span>
              </>
            )}
          </div>
          <p className="text-zinc-300 mt-1">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800">
        {!hasSubmittedCurrent ? (
          <button
            disabled={selectedOption === null}
            onClick={handleConfirmAnswer}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-cyan-950/50"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            disabled={isSubmitting}
            className="px-8 py-3 bg-white hover:bg-zinc-200 text-black font-mono font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <span>{currentQuestionIndex + 1 === totalQuestions ? "Finish Quiz" : "Next Question"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
