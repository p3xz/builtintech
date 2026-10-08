import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";

export const metadata: Metadata = {
  title: "Built In Tech — Interactive Coding Education & 1v1 Arena",
  description: "Learn programming step-by-step with structured modules, practice in sandboxes, solve detective cases, and compete in AI-refereed 1v1 live coding duels.",
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
          <Footer />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
