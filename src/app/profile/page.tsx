"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.username) {
      router.replace(`/profile/${encodeURIComponent(session.user.username)}`);
    } else if (session?.user?.id) {
      router.replace(`/profile/${encodeURIComponent(session.user.id)}`);
    } else {
      router.replace("/login?callbackUrl=/profile");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono text-xs">
      Loading profile...
    </div>
  );
}
