"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  GraduationCap,
  Code2,
  Terminal,
  Search,
  Layers,
  Swords,
  Trophy,
  Award,
  Sparkles,
  Flame,
  Zap,
  Shield,
  User as UserIcon,
  LogOut,
  ChevronDown,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import {
  NotchLeftWing,
  NotchRightWing,
  NotchCornerLeftWing,
  NotchCornerRightWing,
} from "@/components/ui/adaptive-notch-navigation-bar";
import { calculateLevelFromXp } from "@/services/progressService";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalXp = session?.user?.xp ?? 0;
  const streak = session?.user?.currentStreak ?? 0;
  const levelInfo = calculateLevelFromXp(totalXp);

  const navItems = [
    { id: "dashboard", label: "Dashboard", href: "/", icon: GraduationCap },
    { id: "learn", label: "Learn", href: "/learn", icon: GraduationCap },
    { id: "practice", label: "Practice", href: "/problems", icon: Code2 },
    { id: "studio", label: "Code Studio", href: "/studio", icon: Terminal },
    { id: "detective", label: "Detective", href: "/detective", icon: Search, badge: "New" },
    { id: "architect", label: "Architect", href: "/architect", icon: Layers },
    { id: "duel", label: "1v1 Duels", href: "/duel", icon: Swords, badge: "Live" },
    { id: "leaderboard", label: "Ranks", href: "/leaderboard", icon: Trophy },
  ];

  const activeItem =
    navItems.find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) ||
    navItems[0];

  return (
    <div className="sticky top-0 z-40 w-full select-none">
      {/* ── DESKTOP NOTCH NAVIGATION (>= 1024px) ── */}
      <div className="hidden lg:flex relative w-full h-12 justify-between items-start pointer-events-none px-6">
        {/* 1. Left Brand Notch */}
        <aside
          aria-label="Brand logo notch"
          className="pointer-events-auto relative z-50 h-11 px-5 flex items-center bg-[#121214] border-b border-r border-zinc-800 rounded-br-[20px] shadow-lg"
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              <span className="font-mono font-black text-[11px] text-black">B</span>
            </div>
            <span className="font-mono font-bold tracking-tight text-sm text-white">
              Built In <span className="text-cyan-400">Tech</span>
            </span>
          </Link>
          <NotchRightWing position="top" className="text-[#121214]" />
          <NotchCornerLeftWing position="top" className="text-[#121214]" />
        </aside>

        {/* 2. Center Menu Notch */}
        <header
          role="tablist"
          className="pointer-events-auto relative z-50 h-11 px-3 flex items-center gap-1 bg-[#121214] border-b border-x border-zinc-800 rounded-b-[20px] shadow-lg font-mono text-xs"
        >
          <NotchLeftWing position="top" className="text-[#121214]" />
          <NotchRightWing position="top" className="text-[#121214]" />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 outline-none ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </header>

        {/* 3. Right Action Notch */}
        <aside
          aria-label="User actions notch"
          className="pointer-events-auto relative z-50 h-11 px-5 flex items-center gap-3 bg-[#121214] border-b border-l border-zinc-800 rounded-bl-[20px] shadow-lg font-mono text-xs"
        >
          <NotchLeftWing position="top" className="text-[#121214]" />
          <NotchCornerRightWing position="top" className="text-[#121214]" />

          {/* Streak Indicator */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/30 border border-amber-800/40 rounded-full text-[11px] text-amber-400 font-bold"
            title={`${streak} Day Streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400" />
            <span>{streak}</span>
          </div>

          {/* XP Indicator */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950/30 border border-cyan-800/40 rounded-full text-[11px] text-cyan-400 font-bold"
            title={`${totalXp} XP`}
          >
            <Zap className="w-3.5 h-3.5 fill-cyan-400/30 text-cyan-400" />
            <span>{totalXp}</span>
          </div>

          {/* Level Indicator */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-950/30 border border-indigo-800/40 rounded-full text-[11px] text-indigo-300 font-bold"
            title={`Level ${levelInfo.level}`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lv.{levelInfo.level}</span>
          </div>

          {/* User Account / Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {session?.user ? (
              <button
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-full text-xs text-white transition cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[9px]">
                  {session.user.displayName?.[0]?.toUpperCase() || session.user.username?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="truncate max-w-[80px] font-semibold">{session.user.username}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>
            ) : (
              <Link href="/login">
                <button className="px-3.5 py-1 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full text-xs transition cursor-pointer shadow-sm">
                  Sign In
                </button>
              </Link>
            )}

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-xs font-mono">
                <Link
                  href={`/profile/${session?.user?.username || "learner"}`}
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition"
                >
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  My Profile
                </Link>
                <Link
                  href="/achievements"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  Achievements
                </Link>
                <Link
                  href="/certificates"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Certificates
                </Link>
                <Link
                  href="/stats"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition"
                >
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  Learning Stats
                </Link>
                {(session?.user?.role === "admin" || session?.user?.email === "nam4sh@gmail.com") && (
                  <Link
                    href="/admin"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-950/30 rounded-xl transition font-bold"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Console
                  </Link>
                )}
                <div className="my-1 border-t border-zinc-800" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── TABLET & MOBILE VIEW (< 1024px): UNIFIED COMPACT NOTCH ISLAND ── */}
      <div className="lg:hidden relative w-full flex flex-col items-center px-4 pt-1 pointer-events-none">
        <div className="pointer-events-auto relative z-50 w-full max-w-md bg-[#121214] border border-zinc-800 rounded-b-2xl p-2 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between gap-2">
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center">
                <span className="font-mono font-bold text-xs text-black">B</span>
              </div>
              <span className="font-mono font-bold text-xs text-white">
                Built In <span className="text-cyan-400">Tech</span>
              </span>
            </Link>

            {/* Mobile Center Dropdown Trigger */}
            <button
              onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full font-mono text-xs font-semibold text-zinc-200"
            >
              {activeItem?.icon && <activeItem.icon className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{activeItem?.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileDrawerOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mobile Right Quick Status */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-950/40 rounded-full font-mono text-[10px] text-amber-400 font-bold">
                <Flame className="w-2.5 h-2.5" />
                <span>{streak}</span>
              </div>
              {session?.user ? (
                <Link href={`/profile/${session.user.username}`} className="shrink-0">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-[10px]">
                    {session.user.username?.[0]?.toUpperCase()}
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="shrink-0">
                  <button className="px-2 py-0.5 bg-white text-black font-mono font-semibold text-[10px] rounded-full">
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Expandable Mobile Drawer */}
          {isMobileDrawerOpen && (
            <div className="pt-3 border-t border-zinc-800/80 mt-2 grid grid-cols-2 gap-1 font-mono text-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                      isActive ? "bg-zinc-800 text-cyan-400 font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 py-0.2 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {(session?.user?.role === "admin" || session?.user?.email === "nam4sh@gmail.com") && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="col-span-2 flex items-center justify-between px-3 py-2 rounded-xl transition bg-rose-950/30 text-rose-400 font-bold border border-rose-800/40"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin Console</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
