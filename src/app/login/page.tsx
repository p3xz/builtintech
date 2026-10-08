"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, AlertCircle } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    urlError ? "Authentication failed. Please try again with Google." : ""
  );

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0a0b] text-[#f4f4f5] px-4 py-12 selection:bg-cyan-500/30">
      <div className="relative z-10 w-full max-w-md">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
          {/* Brand header */}
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 flex items-center justify-center font-mono font-black text-sm text-black mb-4">
              B
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              Sign In to Built In Tech
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Continue your structured learning track and enter 1v1 coding duels.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-xs font-mono text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-md shadow-white/5"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.54 0 2.94.55 4.04 1.46l3.03-3.03C17.24 1.72 14.81 1 12 1 7.37 1 3.44 3.72 1.63 7.64l3.66 2.84C6.18 7.36 8.86 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.28c0-.85-.08-1.68-.22-2.28H12v4.51h6.47c-.28 1.48-1.12 2.73-2.39 3.58l3.69 2.86c2.16-1.99 3.41-4.92 3.41-8.67z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.48c-.23-.68-.36-1.41-.36-2.18s.13-1.5.36-2.18L1.63 7.28C.59 9.38 0 11.63 0 14s.59 4.62 1.63 6.72l3.66-2.84z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.69-2.86c-1.08.73-2.47 1.16-4.26 1.16-3.14 0-5.82-2.36-6.71-5.48L1.63 16.72C3.44 20.64 7.37 23 12 23z"
                />
              </svg>
              <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>
          </div>

          {/* Privacy & Terms notice */}
          <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono text-center leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-zinc-400 hover:text-white underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-zinc-400 hover:text-white underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-600 font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>OAuth 2.0 &bull; Secure Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center font-mono text-xs text-zinc-500">
          Loading sign-in…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
