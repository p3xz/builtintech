import { IAchievement } from "@/types/learning";
import { getAllAchievements } from "@/data/achievements";

export function getAchievementsWithUserStatus(): IAchievement[] {
  return getAllAchievements();
}
