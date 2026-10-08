import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Rank } from "@/models/Rank";

const DEFAULT_RANKS = [
  { rankId: "apprentice", name: "Apprentice", tier: "Bronze", minimumXP: 0, maximumXP: 499, order: 1, icon: "shield", perks: ["Basic forum access", "Python curriculum access"] },
  { rankId: "code_novice", name: "Code Novice", tier: "Bronze", minimumXP: 500, maximumXP: 1199, order: 2, icon: "terminal", perks: ["Unlock Java track", "Custom profile badge"] },
  { rankId: "syntax_scout", name: "Syntax Scout", tier: "Silver", minimumXP: 1200, maximumXP: 2499, order: 3, icon: "compass", perks: ["Unlock C/C++ Systems track", "Specialist badge"] },
  { rankId: "logic_crafter", name: "Logic Crafter", tier: "Silver", minimumXP: 2500, maximumXP: 4499, order: 4, icon: "cpu", perks: ["Unlock C Low-Level track", "Detective mission access"] },
  { rankId: "algorithm_knight", name: "Algorithm Knight", tier: "Gold", minimumXP: 4500, maximumXP: 7499, order: 5, icon: "zap", perks: ["ClashJudge Duel privileges", "Architect sandbox access"] },
  { rankId: "system_smith", name: "System Smith", tier: "Gold", minimumXP: 7500, maximumXP: 11999, order: 6, icon: "layers", perks: ["Advanced duel rooms", "Gold flair"] },
  { rankId: "byte_master", name: "Byte Master", tier: "Platinum", minimumXP: 12000, maximumXP: 17999, order: 7, icon: "code", perks: ["Beta feature previews", "Platinum profile rim"] },
  { rankId: "runtime_warlord", name: "Runtime Warlord", tier: "Platinum", minimumXP: 18000, maximumXP: 25999, order: 8, icon: "flame", perks: ["Private duel hosting", "Platinum title"] },
  { rankId: "kernel_champion", name: "Kernel Champion", tier: "Diamond", minimumXP: 26000, maximumXP: 35999, order: 9, icon: "award", perks: ["Elite leaderboard highlight", "Diamond crown"] },
  { rankId: "grand_architect", name: "Grand Architect", tier: "Master", minimumXP: 36000, maximumXP: 999999, order: 10, icon: "crown", perks: ["Master Hall of Fame", "Grand Architect custom badge"] },
];

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    let ranks = await Rank.find({}).sort({ order: 1 }).lean();

    if (!ranks || ranks.length === 0) {
      ranks = DEFAULT_RANKS as any;
    }

    const { searchParams } = new URL(req.url);
    const xpParam = searchParams.get("xp");

    if (xpParam !== null) {
      const userXp = parseInt(xpParam, 10) || 0;
      const currentRank = ranks.find(
        (r) => userXp >= r.minimumXP && userXp <= r.maximumXP
      ) || ranks[0];

      const nextRank = ranks.find((r) => r.order === (currentRank?.order || 1) + 1) || null;

      const progressToNext = nextRank
        ? Math.min(
            100,
            Math.max(
              0,
              Math.round(
                ((userXp - currentRank.minimumXP) /
                  (nextRank.minimumXP - currentRank.minimumXP)) *
                  100
              )
            )
          )
        : 100;

      return NextResponse.json({
        success: true,
        currentRank,
        nextRank,
        xp: userXp,
        progressToNext,
        ranks,
      });
    }

    return NextResponse.json({
      success: true,
      ranks,
    });
  } catch (error) {
    console.error("Error fetching ranks:", error);
    return NextResponse.json({
      success: true,
      ranks: DEFAULT_RANKS,
    });
  }
}
