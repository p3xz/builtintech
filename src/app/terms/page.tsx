import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, FileText, Shield, Scale, Lock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Built In Tech",
  description: "Terms of Service governing the use of the Built In Tech / CodeForge platform, educational modules, sandboxed code execution, and 1v1 live duels.",
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
            <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Last Updated: October 8, 2026 &bull; KJU Hacktoberfest Hack Day 2026
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed font-sans text-zinc-300">
          {/* Introduction */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <p className="text-sm font-medium text-white leading-normal">
              Welcome to CodeForge / Built In Tech!
            </p>
            <p className="text-zinc-400">
              These Terms of Service (&quot;Terms&quot;) and Privacy Policy govern your use of the platform, website, and related services (collectively, the &quot;Service&quot;), a project developed during the KJU Hacktoberfest Hack Day 2026. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Scale className="h-4 w-4 text-cyan-400" />
              <h2>1. Acceptance of Terms</h2>
            </div>
            <p className="text-zinc-400">
              By registering for an account, submitting code, or participating in duels on the platform, you confirm that you have read, understood, and agreed to these Terms. You also represent that you have the legal capacity to enter into a binding contract in your jurisdiction.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Shield className="h-4 w-4 text-cyan-400" />
              <h2>2. Description of Service</h2>
            </div>
            <p className="text-zinc-400">
              CodeForge is an educational and competitive programming platform. We provide interactive coding lessons, quizzes, and live 1v1 coding duels. Supported languages include Python, HTML, CSS, JavaScript, SQL, Java, C, C++, C#, PHP, TypeScript, Swift, and Ruby.
            </p>
          </section>

          {/* 3. User Accounts */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">Registration:</strong> You must create an account to access the full features of the Service. You agree to provide accurate, current, and complete information during registration.
              </li>
              <li>
                <strong className="text-white">Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
              </li>
              <li>
                <strong className="text-white">Age Restriction:</strong> The Service is intended for users who are at least 13 years old (in the United States) or 16 years old (in the European Union). By using the Service, you represent that you meet these age requirements.
              </li>
            </ul>
          </section>

          {/* 4. Acceptable Use and Sandbox Security */}
          <section className="space-y-4 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Lock className="h-4 w-4 text-cyan-400" />
              <h2>4. Acceptable Use and Sandbox Security</h2>
            </div>
            <p className="text-zinc-400">
              We provide isolated execution environments (&quot;Sandboxes&quot;) for evaluating your code. This is a core feature, and strict adherence to the following rules is mandatory.
            </p>

            <div className="space-y-2">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                4.1. Prohibited Code Execution
              </h3>
              <p className="text-zinc-400">You agree NOT to submit code or use the Service in any way that attempts to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li>Bypass, exploit, or escape the Sandbox environment to access underlying host systems or infrastructure.</li>
                <li>Execute outbound network requests, port scanning, or Denial-of-Service (DDoS) attacks.</li>
                <li>Mine cryptocurrency or utilize platform compute resources for any unauthorized commercial gain.</li>
                <li>Read, write, or alter files outside of the explicitly permitted execution directory provided during a specific challenge.</li>
                <li>Intentionally exhaust server memory, storage, or CPU resources (e.g., executing &quot;fork bombs,&quot; infinite loops designed to consume maximum resources, or malicious memory leaks).</li>
                <li>Transmit malware, viruses, or any other harmful code.</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                4.2. Competitive Integrity and Anti-Cheat
              </h3>
              <p className="text-zinc-400">The spirit of the platform is learning and fair competition. During live 1v1 duels:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li>You must rely solely on your own knowledge and skills.</li>
                <li>The use of automated scripts, macros, external AI coding assistants (such as GitHub Copilot, ChatGPT, Claude, etc.), or unauthorized copy-pasting of code from external sources during a live, ranked duel is strictly prohibited.</li>
                <li>Any attempt to manipulate match outcomes, artificially inflate ratings (win-trading), or exploit matchmaking algorithms is forbidden.</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                4.3. Enforcement
              </h3>
              <p className="text-zinc-400">We actively monitor sandbox telemetry and user behavior. Violation of these Acceptable Use policies will result in immediate consequences, which may include:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li>Permanent account termination and ban.</li>
                <li>Forfeiture of all progression, badges, and Elo ratings.</li>
                <li>Reporting of malicious activity to appropriate authorities or ISPs, where legally required or necessary to protect our infrastructure.</li>
              </ul>
            </div>
          </section>

          {/* 5. The AI Referee and Match Verdicts */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">5. The AI Referee and Match Verdicts</h2>
            <p className="text-zinc-400">
              CodeForge uses advanced Artificial Intelligence models (the &quot;AI Referee&quot;) to evaluate code submissions during live duels.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">5.1. Evaluation Criteria:</strong> The AI Referee judges submissions based on correctness, efficiency (time and space complexity), readability, and adherence to specific challenge constraints.
              </li>
              <li>
                <strong className="text-white">5.2. Finality of Verdicts:</strong> You acknowledge and agree that all decisions, scores, and commentator-style feedback generated by the AI Referee are final and binding. CodeForge does not offer manual reviews, appeals, or score adjustments for automated duel outcomes.
              </li>
              <li>
                <strong className="text-white">5.3. AI Subjectivity and Limitations:</strong> The AI Referee is an automated system powered by large language models. While we strive for accuracy, you acknowledge that AI evaluations may occasionally be subjective, inconsistent, or factually incorrect (often referred to as &quot;hallucinations&quot;).
              </li>
              <li>
                <strong className="text-white">5.4. Limitation of Liability Regarding AI:</strong> CodeForge shall not be held liable for any loss of ranking, platform standing, perceived unfairness, or distress resulting from inaccurate, subjective, or unfavorable verdicts delivered by the AI Referee. The commentator-style feedback is automatically generated and does not reflect the opinions or views of CodeForge developers.
              </li>
            </ul>
          </section>

          {/* 6. Intellectual Property */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">6. Intellectual Property</h2>
            <div className="space-y-2">
              <p className="text-zinc-300">
                <strong className="text-white">6.1. Platform IP:</strong> All content, features, and functionality on the Service, including but not limited to lessons, quizzes, the underlying matchmaking logic, platform UI, logos, and trademarks, are owned by CodeForge and are protected by international copyright and intellectual property laws.
              </p>
              <p className="text-zinc-300">
                <strong className="text-white">6.2. User Submissions:</strong> You retain ownership of the original code you submit to the Service. However, by submitting code (whether in lessons or duels), you grant CodeForge a worldwide, non-exclusive, royalty-free, perpetual license to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                <li>Execute, store, and process the code to provide the Service.</li>
                <li>Analyze the code via the AI Referee.</li>
                <li>Display the code publicly on leaderboards, user profiles, or in post-match replays.</li>
                <li>Anonymize and aggregate the code for internal analysis and platform improvement.</li>
              </ul>
            </div>
          </section>

          {/* 7. Termination */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">7. Termination</h2>
            <p className="text-zinc-400">
              We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          {/* 8. Disclaimer of Warranties */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-amber-400">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2>8. Disclaimer of Warranties</h2>
            </div>
            <p className="text-zinc-400">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. CodeForge makes no representations or warranties of any kind, express or implied, as to the operation of the Service, the accuracy of the AI Referee, or the information, content, or materials included on the Service.
            </p>
          </section>

          {/* 9. Limitation of Liability */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">9. Limitation of Liability</h2>
            <p className="text-zinc-400">
              To the maximum extent permitted by applicable law, CodeForge shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising out of or related to your use of the Service.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 bg-[#121214] border border-zinc-800 rounded-2xl text-zinc-400">
            <h2 className="text-sm font-bold font-mono text-white mb-2">Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact the Built In Tech development team (KJU Hacktoberfest Hack Day 2026).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
