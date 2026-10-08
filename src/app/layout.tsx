import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { CookieConsent } from "@/components/layout/CookieConsent";

export const metadata: Metadata = {
  title: "ClashJudge — AI-Refereed 1v1 Coding Platform",
  description: "Practice coding problems, climb the ranks, and duel coders in AI-refereed 1v1 showdowns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] antialiased flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
