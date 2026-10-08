"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Award, Printer, Loader2 } from "lucide-react";
import { ICertificate } from "@/types/learning";
import { ErrorState } from "@/components/StatusState";

export default function SingleCertificateViewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = typeof params.id === "string" ? params.id : "";

  const [cert, setCert] = useState<ICertificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    async function fetchCert() {
      try {
        const res = await fetch("/api/user/certificates");
        if (res.ok) {
          const data = await res.json();
          const list: ICertificate[] = data.certificates || [];
          const found = list.find(
            (c) =>
              c.id === id ||
              (c as any)._id === id ||
              c.certificateId?.toLowerCase() === id.toLowerCase()
          );
          if (found) setCert(found);
        }
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCert();
    }
  }, [id, session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-mono">Rendering certificate…</p>
        </div>
      </div>
    );
  }

  if (!cert) return <ErrorState title="Certificate Not Found" message="The requested certificate could not be located in your credentials archive." />;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full font-sans pb-16">
      {/* Top Controls */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Certificates</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Frame */}
      <div className="bg-[#121214] border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center space-y-8 my-4 print:bg-white print:text-black print:border-black">
        {/* Background Crest */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-black flex items-center justify-center mx-auto shadow-xl">
            <Award className="w-8 h-8" />
          </div>
          <span className="font-mono text-xs tracking-widest uppercase text-emerald-400 font-bold block pt-2 print:text-emerald-700">
            Built In Tech &bull; Certificate of Mastery
          </span>
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider print:text-zinc-600">
            This certificate is proudly presented to
          </p>
          <h1 className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight print:text-black">
            {cert.displayName}
          </h1>
          <p className="text-xs font-mono text-cyan-400 print:text-cyan-800">@{cert.username}</p>
        </div>

        {/* Course Info */}
        <div className="space-y-2 max-w-xl mx-auto">
          <p className="text-xs text-zinc-400 print:text-zinc-600">
            For successfully completing all modules, interactive practice challenges, and passing the module checkpoint examinations in:
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300 print:text-emerald-800">
            {cert.courseTitle}
          </h2>
        </div>

        {/* Bottom Signatures & Verification Hash */}
        <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono text-zinc-400 print:border-zinc-300 print:text-zinc-700">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase">Issue Date</span>
            <span className="text-zinc-200 font-bold print:text-black">
              {new Date(cert.issuedAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 block uppercase">Certificate ID</span>
            <span className="text-emerald-400 font-bold print:text-emerald-700">
              {cert.certificateId}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 block uppercase">Verification Hash</span>
            <span className="text-cyan-400 font-bold print:text-cyan-700">
              {cert.verificationHash}
            </span>
          </div>
        </div>

        {/* Disclaimer Note */}
        <p className="text-[10px] font-mono text-zinc-600 print:text-zinc-500">
          Platform Verification &bull; Built In Tech &bull; Non-Accredited Milestone
        </p>
      </div>
    </div>
  );
}
