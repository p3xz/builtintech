import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Shield, Lock, Eye, Database, Cpu, UserX, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Built In Tech",
  description: "Privacy Policy explaining how Built In Tech / CodeForge collects, uses, and protects your information, telemetry, and code submissions.",
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
              Privacy Policy
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Last Updated: October 8, 2026 &bull; KJU Hacktoberfest Hack Day 2026
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed font-sans text-zinc-300">
          {/* Intro */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <p className="text-sm font-medium text-white leading-normal">
              Privacy at Built In Tech / CodeForge
            </p>
            <p className="text-zinc-400">
              This Privacy Policy explains how CodeForge collects, uses, and discloses information about you when you use our Service.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="space-y-4 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Database className="h-4 w-4 text-cyan-400" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-zinc-400">
              We collect information you provide directly to us, as well as data automatically generated through your use of the Service:
            </p>

            <div className="space-y-3">
              <div>
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">
                  1.1. Account Identity Data:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>Username, email address, and hashed credentials.</li>
                  <li>OAuth tokens if you register via third-party services (e.g., Google).</li>
                  <li>Profile information (e.g., avatar, bio).</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">
                  1.2. Telemetry and Usage Data:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>Quiz scores, lesson progression, and completion status.</li>
                  <li>Duel win/loss records, Elo ratings, and match history.</li>
                  <li>Typing speed and interaction metrics within the coding editor.</li>
                  <li>Preferences and settings within the platform.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">
                  1.3. Code Submissions:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>The raw code snippets you write during lessons, quizzes, and live 1v1 duels.</li>
                  <li>The programming language selected.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">
                  1.4. Technical and Device Information:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>IP addresses, browser type, operating system.</li>
                  <li>Log data regarding your interaction with our servers and the execution Sandboxes.</li>
                  <li>Device identifiers necessary for security and abuse prevention.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Eye className="h-4 w-4 text-cyan-400" />
              <h2>2. How We Use Your Information</h2>
            </div>
            <p className="text-zinc-400">We use the collected information for the following primary purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                <strong className="text-white">To Provide and Maintain the Service:</strong> Creating and managing accounts, facilitating authentication, and delivering the core educational and competitive features.
              </li>
              <li>
                <strong className="text-white">To Evaluate Submissions (The AI Referee):</strong> Processing your code submissions through our AI models to determine correctness and generate feedback.
              </li>
              <li>
                <strong className="text-white">Gamification and Matchmaking:</strong> Calculating Elo ratings, updating leaderboards, and pairing you with appropriate opponents for live duels.
              </li>
              <li>
                <strong className="text-white">Security and Platform Integrity:</strong> Monitoring for sandbox abuse, DDoS attacks, cheating, and enforcing our Acceptable Use Policy.
              </li>
              <li>
                <strong className="text-white">Platform Improvement:</strong> Analyzing usage trends and anonymized code data to improve lesson quality, matchmaking algorithms, and platform stability.
              </li>
              <li>
                <strong className="text-white">Communication:</strong> Sending essential service updates, account notifications, or responding to support inquiries.
              </li>
            </ul>
          </section>

          {/* 3. Third-Party AI Data Processing */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <h2>3. Third-Party AI Data Processing</h2>
            </div>
            <p className="text-zinc-400">
              CodeForge's core feature—the AI Referee—relies on third-party artificial intelligence providers (such as Groq, OpenAI, Anthropic, or Google) to evaluate your code.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">API Transmission:</strong> When you submit code for evaluation (especially during duels), your raw code text, the chosen programming language, and the specific problem constraints are transmitted securely via API to our AI partners.
              </li>
              <li>
                <strong className="text-white">Data Training Restrictions:</strong> We prioritize your privacy. CodeForge utilizes enterprise-tier APIs for our AI Referee. Under our agreements with these providers, your submitted code and platform username are <strong>NOT</strong> used by these third parties to train, retrain, or improve their foundational AI models. Your code is processed solely to generate the verdict for your specific match.
              </li>
            </ul>
          </section>

          {/* 4. Data Sharing and Disclosure */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">4. Data Sharing and Disclosure</h2>
            <p className="text-zinc-400">We do not sell your personal data. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                <strong className="text-white">Public Display:</strong> Your username, profile picture, public Elo rating, duel history, and code submitted during public matches may be visible to other users on the platform (e.g., via leaderboards or replays).
              </li>
              <li>
                <strong className="text-white">Service Providers:</strong> We may share data with trusted third-party vendors (e.g., cloud hosting providers like AWS/GCP, database services) who assist us in operating the platform, subject to strict confidentiality agreements.
              </li>
              <li>
                <strong className="text-white">Legal Compliance:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).
              </li>
            </ul>
          </section>

          {/* 5. Children's Privacy */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">5. Children&apos;s Privacy (COPPA &amp; GDPR-K Compliance)</h2>
            <p className="text-zinc-400">CodeForge is an educational platform, but it is not intended for young children.</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                <strong className="text-white">Age Restriction:</strong> Our Service is intended only for individuals aged 13 or older (in the US) or 16 or older (in the EU). We do not knowingly collect personal information from children under these required ages.
              </li>
              <li>
                <strong className="text-white">Data Deletion:</strong> If we become aware that we have inadvertently collected personal data from a child under the minimum required age without verifiable parental consent, we will take immediate steps to delete that information from our servers. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </li>
            </ul>
          </section>

          {/* 6. Data Retention and Deletion */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
              <UserX className="h-4 w-4 text-cyan-400" />
              <h2>6. Data Retention and Deletion</h2>
            </div>
            <p className="text-zinc-400">
              We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.
            </p>
            <p className="text-zinc-300">
              <strong className="text-white">Account Deletion Protocol:</strong> You have the right to request the deletion of your account. Upon receiving a verified deletion request, we will:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-300">
              <li>Wipe your identifiable data (email, credentials, linked OAuth tokens).</li>
              <li>Zero out your Elo rating.</li>
              <li>Anonymize your past code submissions and match history. (Note: We must retain the anonymized code and outcomes to preserve the replay history and integrity of the records for the opponents you have faced).</li>
            </ul>
          </section>

          {/* 7. Changes to these Policies */}
          <section className="space-y-3 p-6 bg-[#121214] border border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold font-mono text-white">7. Changes to these Policies</h2>
            <p className="text-zinc-400">
              We reserve the right to update or modify these Terms of Service and Privacy Policy at any time. If we make material changes, we will notify you by updating the &quot;Last Updated&quot; date at the top of this document or by providing notice through the Service. Your continued use of the Service following the posting of changes constitutes your acceptance of those changes.
            </p>
          </section>

          {/* 8. Contact Information */}
          <section className="p-6 bg-[#121214] border border-zinc-800 rounded-2xl text-zinc-400">
            <h2 className="text-sm font-bold font-mono text-white mb-2">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms or this Privacy Policy, please contact the Built In Tech development team (KJU Hacktoberfest Hack Day 2026).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
