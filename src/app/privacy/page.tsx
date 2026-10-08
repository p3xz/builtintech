import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Shield, Lock, Eye, Scale, Database, UserCheck, AlertTriangle, Mail, ShieldAlert, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | ClashJudge",
  description: "Review how ClashJudge handles developer telemetry, sandboxed code execution privacy, AI referee analysis, and data protection.",
};

export default function PrivacyPage() {
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
            <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <Shield className="h-4 w-4" />
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
              Clash<span className="text-cyan-400">Judge</span> Privacy Policy
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
              Welcome to <strong>ClashJudge</strong>. We value your privacy, operate with full transparency, and adhere to strict data minimization principles.
            </p>
            <p className="text-zinc-400">
              This Privacy Policy explains how ClashJudge (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, processes, and protects your information when you access our coding platform, execute code in our sandboxes, compete in 1v1 live duels, and interact with our automated AI referee systems.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Database className="h-4 w-4 text-cyan-400" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-zinc-400">
              We collect only the minimum data necessary to operate our competitive coding platform and referee matches:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">Authentication Data:</strong> We operate a password-free platform. When you sign in via Google OAuth or Email OTP (One-Time Passcode), we store your verified email address, chosen username, display name, and avatar. No passwords are ever stored.
              </li>
              <li>
                <strong className="text-white">Code Submissions &amp; Practice Metrics:</strong> We record your source code submissions, selected programming language (Python 3.14, JavaScript Deno, C++ g++-15, Java OpenJDK 25, C gcc-15), wall-clock execution runtime, test pass counts, and solved problem statuses.
              </li>
              <li>
                <strong className="text-white">1v1 Duel &amp; Competitive Telemetry:</strong> In 1v1 duels, we record match histories, room codes, timestamps, test completion percentages, win/loss/draw records, and Elo rating updates.
              </li>
              <li>
                <strong className="text-white">AI Referee Insights:</strong> When refereeing a completed duel, our AI analysis pipeline parses your submitted code to evaluate readability scores, code cleanliness, and constructive coaching feedback.
              </li>
              <li>
                <strong className="text-white">Security &amp; Rate-Limiting Telemetry:</strong> Safe request metadata including IP addresses, browser user-agents, and request timestamps are processed solely for sliding-window rate limiting, DDoS protection, and abuse prevention.
              </li>
            </ul>
          </section>

          {/* 2. How We Use Information */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Eye className="h-4 w-4 text-cyan-400" />
              <h2>2. How We Use Your Information</h2>
            </div>
            <p className="text-zinc-400">We process your data strictly under legitimate legal bases:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>To evaluate code against server-side hidden test suites and determine problem accuracy.</li>
              <li>To referee 1v1 coding showdowns, determine match winners, and calculate Elo rating changes.</li>
              <li>To generate automated AI coaching reports, code readability metrics, and ringside commentaries.</li>
              <li>To maintain global rankings, developer profiles, daily practice streaks, and Experience Points (XP).</li>
              <li>To protect platform integrity against automated bots, scraping scripts, and sandbox escape attempts.</li>
            </ul>
            <p className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-zinc-800/80">
              ✓ We never sell, rent, monetize, or share your personal data with third-party advertisers or data brokers.
            </p>
          </section>

          {/* 3. Code Execution & Sandboxing Privacy */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Lock className="h-4 w-4 text-cyan-400" />
              <h2>3. Code Execution &amp; Sandboxing Privacy</h2>
            </div>
            <p className="text-zinc-400">
              When you run or submit code, your source code is evaluated in isolated, ephemeral sandboxes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>Subprocess execution runs with non-root privileges inside secured containers.</li>
              <li>Outbound network connectivity is restricted to prevent external communications or data exfiltration.</li>
              <li>Strict execution timeouts (35s maximum client-side, 3-5s per test case) terminate infinite loops.</li>
              <li>Source files are processed in ephemeral containers and wiped after execution.</li>
            </ul>
          </section>

          {/* 4. AI Referee & Third-Party Services */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <h2>4. AI Referee &amp; Third-Party Services</h2>
            </div>
            <p className="text-zinc-400">We partner with secure, privacy-conscious infrastructure providers:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                <strong className="text-white">OnlineCompiler API:</strong> High-performance isolated compilation sandbox for multi-language execution.
              </li>
              <li>
                <strong className="text-white">Groq AI Inference API:</strong> Secure, fast LLM inference (`openai/gpt-oss-20b`) for evaluating code readability and generating ringside coaching commentary. Zero customer code is used for training foundation models.
              </li>
              <li>
                <strong className="text-white">MongoDB:</strong> Database storage for user accounts, problem suites, and match logs with encrypted data at rest (AES-256).
              </li>
              <li>
                <strong className="text-white">Google OAuth:</strong> Decentralized OAuth authentication protocol.
              </li>
            </ul>
          </section>

          {/* 5. GDPR & CCPA Data Rights */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <UserCheck className="h-4 w-4 text-cyan-400" />
              <h2>5. Your Data Rights (GDPR &amp; CCPA)</h2>
            </div>
            <p className="text-zinc-400">Regardless of your location, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li><strong>Right of Access &amp; Portability:</strong> Request a complete copy of your submissions and account data.</li>
              <li><strong>Right to Rectification:</strong> Update your profile name, display information, and preferences at any time.</li>
              <li><strong>Right to Erasure:</strong> Request permanent account deletion, wiping all personal records from our database.</li>
              <li><strong>Non-Discrimination:</strong> You will never receive degraded service or penalty for exercising your privacy rights.</li>
            </ul>
          </section>

          {/* 6. Children's Privacy */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-amber-400">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2>6. Children&apos;s Privacy (COPPA)</h2>
            </div>
            <p className="text-zinc-400">
              ClashJudge is intended for developers, students, and competitive programmers aged <strong>13 and older</strong>. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          {/* 7. Contact */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Mail className="h-4 w-4 text-cyan-400" />
              <h2>7. Contact &amp; Inquiries</h2>
            </div>
            <p className="text-zinc-400">
              For any questions or privacy inquiries, contact the ClashJudge team:
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
