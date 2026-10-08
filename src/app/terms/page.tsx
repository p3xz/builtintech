import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, FileText, AlertTriangle, ShieldCheck, Scale, Lock, Ban, Mail, UserCheck, Swords } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | ClashJudge",
  description: "Terms and conditions for using the ClashJudge algorithmic practice platform, sandboxed code execution, and 1v1 AI-refereed duels.",
};

export default function TermsPage() {
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
            <div className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
              Clash<span className="text-cyan-400">Judge</span> Terms of Service
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-500">
            Last Updated &amp; Effective Date: October 2026 &bull; Version 1.2
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed font-sans text-zinc-300">
          {/* Welcome */}
          <section className="space-y-3">
            <p className="text-sm font-medium text-white leading-normal">
              Welcome to <strong>ClashJudge</strong>!
            </p>
            <p className="text-zinc-400">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of ClashJudge (&quot;the Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By accessing, browsing, practicing problems, or engaging in 1v1 coding duels on ClashJudge, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the platform.
            </p>
          </section>

          {/* 1. Description of Service */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h2>1. Description of Service</h2>
            </div>
            <p className="text-zinc-400">
              ClashJudge provides an interactive, competitive software development and algorithm learning arena. Features include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>Sandboxed multi-language code execution across Python, JavaScript, C++, Java, and C.</li>
              <li>Automated evaluation against public example cases and hidden stress test suites.</li>
              <li>Live 1v1 coding duels with real-time timers, automated state synchronizations, and winner determinations.</li>
              <li>Automated AI referee analysis evaluating code correctness, wall-clock efficiency, code readability, and coaching feedback.</li>
              <li>XP, daily coding streaks, developer profiles, and competitive Elo leaderboards.</li>
            </ul>
          </section>

          {/* 2. Acceptable Use & Code Runner Rules */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Lock className="h-4 w-4 text-cyan-400" />
              <h2>2. Acceptable Use &amp; Prohibited Conduct</h2>
            </div>
            <p className="text-zinc-400">
              You agree to use ClashJudge solely for legitimate algorithmic training and competitive coding. You are strictly prohibited from:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>Attempting to escape, compromise, or disrupt the OnlineCompiler execution sandbox or underlying server infrastructure.</li>
              <li>Executing malicious code, fork bombs, network port scans, denial-of-service scripts, or cryptocurrency miners.</li>
              <li>Using automated bots, macro scripts, or unauthorized clients to spoof duel submissions, farm XP, or inflate streak counters.</li>
              <li>Attempting unauthorized access to private duel rooms, administrative endpoints, or other user accounts.</li>
              <li>Harassing opponents, exploiting room vulnerabilities, or manipulating rating algorithms.</li>
            </ul>
          </section>

          {/* 3. Username Policy & Identity */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <UserCheck className="h-4 w-4 text-cyan-400" />
              <h2>3. Username Policy &amp; Community Standards</h2>
            </div>
            <p className="text-zinc-400">
              Your nickname represents your identity in duels, match histories, and global leaderboards. When selecting or updating your handle, you agree not to use usernames that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>Contain hate speech, slurs, discrimination, or targeted harassment.</li>
              <li>Are sexually explicit, obscene, or promote illegal acts.</li>
              <li>Impersonate ClashJudge staff, administrators, official bots, or other members.</li>
              <li>Are deceptive or misleading to other competitors.</li>
            </ul>
          </section>

          {/* 4. Intellectual Property & Code Ownership */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Scale className="h-4 w-4 text-cyan-400" />
              <h2>4. Intellectual Property &amp; User Code Rights</h2>
            </div>
            <p className="text-zinc-400">
              <strong className="text-white">You retain 100% intellectual property ownership</strong> of any original source code you write and submit on ClashJudge.
            </p>
            <p className="text-zinc-400">
              By submitting code to a 1v1 duel or problem validator, you grant ClashJudge a worldwide, non-exclusive license solely to execute, compile, evaluate, display to match participants, and analyze your solution with the AI referee.
            </p>
            <p className="text-zinc-400">
              All proprietary platform code, visual designs, logos, problem statements, test suites, and referee commentary algorithms remain the exclusive intellectual property of ClashJudge.
            </p>
          </section>

          {/* 5. Account Suspension & Termination */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-rose-400">
              <Ban className="h-4 w-4 text-rose-400" />
              <h2>5. Suspension &amp; Termination</h2>
            </div>
            <p className="text-zinc-400">
              We reserve the right to suspend or revoke access for any account found in violation of these Terms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li><strong>Rating &amp; XP Reset:</strong> Any XP, streak records, or duel Elo ratings gained via cheating, bots, or exploits will be stripped.</li>
              <li><strong>Immediate Suspension:</strong> Sandbox escape attempts, automated abuse, or malicious payloads will trigger permanent suspension.</li>
              <li><strong>Voluntary Deletion:</strong> You may request account deletion at any time, which permanently removes your personal profile and submission records.</li>
            </ul>
          </section>

          {/* 6. Disclaimer & Limitation of Liability */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-amber-400">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2>6. Disclaimer &amp; Limitation of Liability</h2>
            </div>
            <p className="text-zinc-400">
              ClashJudge is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis without express or implied warranties. We do not guarantee uninterrupted availability, error-free code execution, or infallible AI referee judgments. To the maximum extent permitted by applicable law, ClashJudge and its maintainers shall not be liable for any indirect, incidental, or consequential damages.
            </p>
          </section>

          {/* 7. Contact */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Mail className="h-4 w-4 text-cyan-400" />
              <h2>7. Contact &amp; Questions</h2>
            </div>
            <p className="text-zinc-400">
              If you have any questions or concerns regarding these Terms of Service, contact us:
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
