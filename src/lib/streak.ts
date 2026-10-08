export interface StreakCalculationResult {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date format YYYY-MM-DD
}

export function calculateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate?: string
): StreakCalculationResult {
  const today = new Date().toISOString().split("T")[0];

  if (!lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActiveDate: today,
    };
  }

  if (lastActiveDate === today) {
    return {
      currentStreak,
      longestStreak,
      lastActiveDate: today,
    };
  }

  const lastDate = new Date(lastActiveDate);
  const currDate = new Date(today);
  const diffTime = currDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const updatedStreak = currentStreak + 1;
    return {
      currentStreak: updatedStreak,
      longestStreak: Math.max(updatedStreak, longestStreak),
      lastActiveDate: today,
    };
  }

  // Streak broken
  return {
    currentStreak: 1,
    longestStreak: Math.max(1, longestStreak),
    lastActiveDate: today,
  };
}
