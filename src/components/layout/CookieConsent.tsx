"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Cookie, X, Settings2, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "clashjudge-cookie-consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

const DEFAULT_PREFS: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: true,
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        setPrefs(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const savePreferences = useCallback((newPrefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch {
      // Ignore
    }
    setPrefs(newPrefs);
    setVisible(false);
    setModalOpen(false);
  }, []);

  const handleAcceptAll = () => {
    savePreferences({ necessary: true, analytics: true, functional: true });
  };

  const handleRejectOptional = () => {
    savePreferences({ necessary: true, analytics: false, functional: false });
  };

  const handleSaveCustom = () => {
    savePreferences(prefs);
  };

  if (!visible && !modalOpen) return null;

  return (
    <>
      {/* Banner */}
      {visible && !modalOpen && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto max-w-2xl w-full bg-[#121214]/95 border border-zinc-800 backdrop-blur-md rounded-xl p-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <Cookie className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                We use cookies to maintain your session, active duel state, and editor settings.{" "}
                <a href="/cookies" className="underline text-cyan-400 hover:text-cyan-300">
                  Cookie Policy
                </a>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => setModalOpen(true)}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[11px] flex items-center gap-1 transition"
              >
                <Settings2 className="w-3 h-3" />
                Manage
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[11px] transition"
              >
                Essential Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded text-[11px] transition"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">Cookie Preferences</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-white mb-0.5">Strictly Necessary</div>
                  <div className="text-[11px] text-zinc-400">NextAuth session tokens &amp; CSRF protection</div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Required
                </span>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-white mb-0.5">Functional &amp; State</div>
                  <div className="text-[11px] text-zinc-400">Remember duel nickname &amp; language preferences</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.functional}
                  onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                  className="rounded border-zinc-700 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-white mb-0.5">Anonymous Telemetry</div>
                  <div className="text-[11px] text-zinc-400">Aggregated compile runtime and performance logs</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                  className="rounded border-zinc-700 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleRejectOptional}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg transition text-[11px]"
              >
                Reject Optional
              </button>
              <button
                onClick={handleSaveCustom}
                className="flex-1 py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition text-[11px]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
