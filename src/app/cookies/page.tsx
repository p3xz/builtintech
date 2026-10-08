import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Cookie, Shield, Check, Settings2, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | ClashJudge",
  description: "Learn how ClashJudge uses cookies and local storage to manage user sessions, code editor state, and platform preferences.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Cookie className="h-4 w-4" />
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
              Clash<span className="text-cyan-400">Judge</span> Cookie Policy
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-500">
            Last Updated &amp; Effective Date: October 2026 &bull; Version 1.2
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed font-sans text-zinc-300">
          {/* Introduction */}
          <section className="space-y-3">
            <p className="text-sm font-medium text-white leading-normal">
              This Cookie Policy explains how ClashJudge uses cookies, local storage, and session storage to provide a secure and seamless coding experience.
            </p>
            <p className="text-zinc-400">
              We respect your digital privacy. We do not use intrusive third-party cross-site trackers or ad network cookies. All cookies and storage mechanisms are strictly intended for platform functionality, security, and developer convenience.
            </p>
          </section>

          {/* 1. What are Cookies? */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Info className="h-4 w-4 text-cyan-400" />
              <h2>1. What Are Cookies and Storage Technologies?</h2>
            </div>
            <p className="text-zinc-400">
              Cookies and web storage technologies (`localStorage` and `sessionStorage`) are small data fragments saved directly in your web browser. They allow our application to remember your active duel rooms, your preferred programming language, your authentication tokens, and your customized editor settings without asking you to log in on every page refresh.
            </p>
          </section>

          {/* 2. Categories of Cookies We Use */}
          <section className="space-y-4 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Settings2 className="h-4 w-4 text-cyan-400" />
              <h2>2. Categories of Cookies We Use</h2>
            </div>

            {/* Category A */}
            <div className="p-4 bg-black/40 border border-zinc-800/90 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400 text-xs">
                  A. Strictly Necessary &amp; Security Cookies
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                  Always Active
                </span>
              </div>
              <p className="text-zinc-400">
                Essential for basic navigation, NextAuth session tokens, CSRF protection, and route security. Without these cookies, the platform cannot function securely.
              </p>
              <div className="font-mono text-[11px] text-zinc-500">
                Examples: `authjs.session-token`, `__Secure-authjs.csrf-token`, `next-auth.callback-url`
              </div>
            </div>

            {/* Category B */}
            <div className="p-4 bg-black/40 border border-zinc-800/90 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400 text-xs">
                  B. Functional &amp; Workspace State Storage
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40">
                  Functional
                </span>
              </div>
              <p className="text-zinc-400">
                Remembers your selected coding language in the Monaco editor (Python, C++, JS, etc.), temporary duel room nicknames (`sessionStorage`), and problem drawer tab states.
              </p>
              <div className="font-mono text-[11px] text-zinc-500">
                Examples: `clashjudge_name`, `clashjudge_name_[ROOM]`, `clashjudge_preferred_lang`
              </div>
            </div>

            {/* Category C */}
            <div className="p-4 bg-black/40 border border-zinc-800/90 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-rose-400 text-xs">
                  C. Analytics &amp; Performance Telemetry
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Optional
                </span>
              </div>
              <p className="text-zinc-400">
                Aggregated system health metrics, compile execution error rates, and load-balancing telemetry to help our engineering team optimize code sandbox response times.
              </p>
            </div>
          </section>

          {/* 3. Managing Cookie Preferences */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Shield className="h-4 w-4 text-cyan-400" />
              <h2>3. How to Control and Manage Cookies</h2>
            </div>
            <p className="text-zinc-400">
              You can control cookies through your web browser settings at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>You can configure your browser to block third-party cookies or delete existing cookies upon browser close.</li>
              <li>You can clear your local storage and session storage cache in developer tools or browser privacy settings.</li>
              <li>Please note that disabling strictly necessary cookies will prevent sign-in and problem submission features from functioning.</li>
            </ul>
          </section>

          {/* 4. Contact */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Cookie className="h-4 w-4 text-cyan-400" />
              <h2>4. Questions Regarding Cookies</h2>
            </div>
            <p className="text-zinc-400">
              If you have any questions regarding our cookie practices, please contact us at:
            </p>
            <p className="font-mono text-xs text-cyan-400">
              Email: <a href="mailto:support@clashjudge.io" className="underline hover:text-cyan-300">support@clashjudge.io</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
