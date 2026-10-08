"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, ShieldCheck, RefreshCw, CheckCircle2, Sparkles } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/problems";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(urlError ? "Authentication failed. Please try again." : "");
  const [infoMsg, setInfoMsg] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Generate static random values once per mount to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const blobsData = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 200 + 160,
      left: Math.random() * 75 + 10,
      top: Math.random() * 75 + 10,
      animationDelay: Math.random() * -20,
      animationDuration: Math.random() * 15 + 15,
    }));
  }, []);

  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const speed = (index + 1) * 18;
          blob.style.marginLeft = `${x * speed}px`;
          blob.style.marginTop = `${y * speed}px`;
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGoogleSignIn = () => {
    if (!agreedToTerms) {
      setErrorMsg("You must accept the Terms of Service and Privacy Policy to proceed.");
      return;
    }
    signIn("google", { callbackUrl });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setErrorMsg("You must accept the Terms of Service and Privacy Policy to proceed.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setInfoMsg(`Passcode dispatched to ${email.trim()}`);
        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
        }
      } else {
        setErrorMsg(data.error || "Failed to send verification passcode");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setErrorMsg("You must accept the Terms of Service and Privacy Policy to proceed.");
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit passcode");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await signIn("email-otp", {
        email: email.trim(),
        otp: otp.trim(),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMsg("Invalid or expired verification code.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMsg("Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mercury-wrapper relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505] text-[#f4f4f5]">
      <style>{`
        :root {
          --mercury: #22d3ee;
          --mercury-dark: #083344;
          --accent: #ffffff;
          --text-dim: rgba(255, 255, 255, 0.5);
          --filter-goo: url('#gooey');
        }

        .stage {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          filter: var(--filter-goo);
          opacity: 0.45;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          background: linear-gradient(135deg, #22d3ee, #0ea5e9, #fb7185);
          border-radius: 50%;
          filter: blur(25px);
          animation: float 22s infinite alternate ease-in-out;
          box-shadow: inset -10px -10px 25px rgba(0,0,0,0.6), 
                      10px 10px 30px rgba(34,211,238,0.3);
          transition: margin 0.15s ease-out;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(8vw, 15vh) scale(1.15); }
          66% { transform: translate(-6vw, 8vh) scale(0.85); }
          100% { transform: translate(6vw, -10vh) scale(1.1); }
        }

        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          padding: 36px 32px;
          background: rgba(18, 18, 20, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(34, 211, 238, 0.05);
        }

        .form-group {
          position: relative;
          margin-bottom: 24px;
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .form-group:focus-within {
          transform: translateX(6px);
        }

        .form-group label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-dim);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-group input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--accent);
          padding: 10px 0;
          font-size: 16px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: border-color 0.4s;
        }

        .input-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background: #22d3ee;
          transition: width 0.5s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: 0 0 15px #22d3ee;
        }

        .form-group input:focus + .input-glow {
          width: 100%;
        }

        .submit-wrap {
          margin-top: 32px;
          position: relative;
        }

        .btn-mercury {
          background: #ffffff;
          color: #000000;
          border: none;
          padding: 16px 28px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          width: 100%;
          border-radius: 12px;
          position: relative;
          z-index: 2;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-mercury:hover {
          letter-spacing: 3px;
          background: #e2e8f0;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
        }

        .svg-filter-hidden {
          position: absolute;
          width: 0;
          height: 0;
        }
      `}</style>

      {/* SVG Gooey Filter */}
      <svg className="svg-filter-hidden" aria-hidden="true">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Liquid Physics Blobs */}
      {mounted && (
        <div className="stage" id="stage">
          {blobsData.map((data, index) => (
            <div
              key={index}
              ref={(el) => {
                blobRefs.current[index] = el;
              }}
              className="blob"
              style={{
                width: `${data.size}px`,
                height: `${data.size}px`,
                left: `${data.left}%`,
                top: `${data.top}%`,
                animationDelay: `${data.animationDelay}s`,
                animationDuration: `${data.animationDuration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Neural Access Box */}
      <main className="auth-container">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Arena
          </Link>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded uppercase tracking-wider">
            AUTH NODE: 0xCLASH
          </span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <span className="font-mono text-[10px] tracking-[4px] uppercase text-zinc-400 block mb-1">
            System Authentication
          </span>
          <h1 className="font-black text-4xl sm:text-5xl font-mono tracking-tight text-white leading-none">
            NEURAL<br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-rose-400 bg-clip-text text-transparent">
              ACCESS
            </span>
          </h1>
        </header>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/70 rounded-xl text-xs font-mono text-rose-300 mb-6">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-cyan-950/50 border border-cyan-800/70 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {devOtpHint && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/70 rounded-xl text-xs font-mono text-emerald-300 mb-6">
            <span className="font-bold">Dev Demo Passcode:</span> {devOtpHint}
          </div>
        )}

        {/* Legal Consent Checkbox */}
        <div className="flex items-start gap-2.5 mb-6 p-3 bg-black/40 border border-zinc-800 rounded-xl text-[11px] font-mono">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 rounded border-zinc-700 accent-cyan-400 cursor-pointer h-3.5 w-3.5"
          />
          <label htmlFor="agreeTerms" className="text-zinc-400 cursor-pointer leading-relaxed select-none">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/privacy" target="_blank" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/cookies" target="_blank" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
              Cookie Policy
            </Link>
            .
          </label>
        </div>

        {/* Google OAuth Stream Init */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full mb-6 flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono font-semibold text-white transition cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
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
          Initialize Stream via Google
        </button>

        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t border-zinc-800" />
          <span className="absolute bg-[#121214] px-3 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            OR DISPATCH SECURE OTP
          </span>
        </div>

        {/* Email OTP Auth Form */}
        {step === "email" ? (
          <form onSubmit={handleSendOtp} autoComplete="off">
            <div className="form-group">
              <label>Coder Identity (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="neo@clashjudge.io"
                required
              />
              <div className="input-glow"></div>
            </div>

            <div className="submit-wrap">
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-mercury disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    Dispatch Passcode →
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} autoComplete="off">
            <div className="form-group">
              <div className="flex items-center justify-between mb-1">
                <label>Sequence Key (6-Digit OTP)</label>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                autoFocus
                required
                className="tracking-[0.4em] text-center text-xl font-bold"
              />
              <div className="input-glow"></div>
            </div>

            <div className="submit-wrap">
              <button
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                className="btn-mercury disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying Key...
                  </>
                ) : (
                  <>
                    Initialize Stream →
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer info & Legal Links */}
        <footer className="mt-8 pt-4 border-t border-zinc-800/80 space-y-3 font-mono text-[10px]">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              ENCRYPTED RECOVERY
            </span>
            <span className="text-zinc-600">ZERO PASSWORDS STORED</span>
          </div>
          <div className="text-center text-zinc-500">
            By signing in, you confirm acceptance of our{" "}
            <Link href="/terms" className="text-zinc-400 underline hover:text-white">Terms</Link>
            {" & "}
            <Link href="/privacy" className="text-zinc-400 underline hover:text-white">Privacy Policy</Link>.
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-xs text-zinc-500">Initializing Neural Stream...</div>}>
      <LoginContent />
    </Suspense>
  );
}
