"use client";

import React from "react";
import BeamWordmarkFooter, { FooterColumn, FooterSocial } from "@/components/ui/beam-wordmark-footer";

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "Interactive Courses", href: "/learn" },
      { label: "Problem Practice", href: "/problems" },
      { label: "1v1 Live Duels", href: "/duel" },
      { label: "Code Studio", href: "/studio" },
    ],
  },
  {
    title: "Missions & Ranks",
    links: [
      { label: "Code Detective", href: "/detective" },
      { label: "Code Architect", href: "/architect" },
      { label: "Leaderboards", href: "/leaderboard" },
      { label: "Certificates", href: "/certificates" },
    ],
  },
  {
    title: "Legal & Policies",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Sign In", href: "/login" },
    ],
  },
];

const FOOTER_SOCIALS: FooterSocial[] = [
  { label: "GitHub", href: "https://github.com/p3xz/builtintech", icon: "github" },
];

export function Footer() {
  return (
    <BeamWordmarkFooter
      brand="Built In Tech"
      wordmark="BUILTINTECH"
      year={2026}
      columns={FOOTER_COLUMNS}
      socials={FOOTER_SOCIALS}
      accent="#22d3ee"
      wordTop="#0ea5e9"
      wordFoot="#02040b"
      background="#050508"
    />
  );
}
