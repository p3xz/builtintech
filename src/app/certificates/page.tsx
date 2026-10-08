"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Award,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ICertificate } from "@/types/learning";

export default function CertificatesDirectoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    async function fetchCertificates() {
      try {
        const res = await fetch("/api/user/certificates");
        if (!res.ok) throw new Error("Failed to load certificates");
        const data = await res.json();
        setCertificates(data.certificates || []);
      } catch (e) {
        setError("Could not load your certificates. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-mono">Loading your certificates…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-400 font-mono">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs rounded-xl cursor-pointer hover:bg-zinc-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Course Credentials</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            Course Certificates
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Earn verifiable completion certificates by finishing all modules and
            passing final checkpoints.
          </p>
        </div>

        <div className="bg-[#121214] border border-zinc-800 px-4 py-2.5 rounded-xl font-mono text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">
            Certificates Earned
          </span>
          <span className="text-lg font-bold text-emerald-400">
            {certificates.length}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 mb-8">
        ℹ️{" "}
        <strong>Platform Credentials:</strong> These certificates represent
        learning milestones on Built In Tech and are not accredited academic
        credentials.
      </div>

      {/* Certificates Grid or Empty State */}
      {certificates.length === 0 ? (
        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <Award className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold font-mono text-white">
            No certificates yet
          </h3>
          <p className="text-xs text-zinc-400">
            Complete all modules and pass the checkpoint quizzes of any course
            track to unlock your completion certificate.
          </p>
          <Link href="/learn">
            <button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl transition cursor-pointer">
              Explore Courses →
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#121214] border border-zinc-800 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition shadow-xl relative overflow-hidden"
            >
              {/* Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
                    {cert.certificateId}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Grade:{" "}
                    <strong className="text-emerald-400">{cert.grade}</strong>
                  </span>
                </div>

                <h3 className="text-xl font-bold font-mono text-white mb-1">
                  {cert.courseTitle}
                </h3>
                <p className="text-xs text-zinc-400 mb-6">
                  Awarded to{" "}
                  <strong className="text-zinc-200">{cert.displayName}</strong>{" "}
                  (@{cert.username}) on{" "}
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </p>

                <div className="p-3.5 rounded-2xl bg-[#0d0d0f] border border-zinc-800 text-xs font-mono text-zinc-400 space-y-1 mb-6">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Verification Hash:</span>
                    <span className="text-cyan-300 font-bold">
                      {cert.verificationHash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Language Track:</span>
                    <span className="uppercase text-white">{cert.language}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80">
                <Link href={`/certificates/${cert.id}`} className="w-full">
                  <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Certificate</span>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
