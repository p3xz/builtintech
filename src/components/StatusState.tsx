"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, FolderSearch, RefreshCw, ArrowRight } from "lucide-react";

export function LoadingState({ message = "Loading your course..." }: { message?: string }) {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-mono text-zinc-400">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load your progress. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-[#121214] border border-rose-900/50 rounded-2xl p-8 text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold font-mono text-white mb-2">{title}</h3>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-semibold rounded-lg transition inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "No items found",
  message = "You haven't started a course yet.",
  actionHref,
  actionLabel = "Get Started",
}: {
  title?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-500 flex items-center justify-center mx-auto mb-4">
        <FolderSearch className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold font-mono text-white mb-2">{title}</h3>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6">{message}</p>
      {actionHref && (
        <Link href={actionHref}>
          <button className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold rounded-lg transition inline-flex items-center gap-2 cursor-pointer">
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      )}
    </div>
  );
}
