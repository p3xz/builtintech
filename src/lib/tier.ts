export type DuelTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Champion";

export function getTierFromRating(rating: number): {
  tier: DuelTier;
  color: string;
  badge: string;
} {
  const r = Math.max(0, rating || 1000);
  if (r >= 2100) {
    return { tier: "Champion", color: "text-amber-400", badge: "🏆 Champion" };
  }
  if (r >= 1900) {
    return { tier: "Master", color: "text-rose-400", badge: "👑 Master" };
  }
  if (r >= 1700) {
    return { tier: "Diamond", color: "text-cyan-300", badge: "💎 Diamond" };
  }
  if (r >= 1500) {
    return { tier: "Platinum", color: "text-teal-400", badge: "⚡ Platinum" };
  }
  if (r >= 1300) {
    return { tier: "Gold", color: "text-yellow-400", badge: "⭐ Gold" };
  }
  if (r >= 1100) {
    return { tier: "Silver", color: "text-slate-300", badge: "🛡️ Silver" };
  }
  return { tier: "Bronze", color: "text-amber-600", badge: "⚔️ Bronze" };
}
