import { Badge, Completion, Habit } from "../../types";
import { getCurrentStreak } from "./streakService";

// Badge definitions (Phase 3)
export const BADGE_DEFINITIONS: Omit<Badge, "unlocked" | "unlockedAt">[] = [
  {
    id: "first_step",
    name: "First Step",
    description: "Complete any habit once",
    icon: "👣",
  },
  {
    id: "streak_3",
    name: "3-Day Streak",
    description: "Maintain a 3-day streak",
    icon: "🔥",
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
  },
  {
    id: "streak_14",
    name: "Two Weeks Strong",
    description: "Maintain a 14-day streak",
    icon: "💪",
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "🏆",
  },
  {
    id: "perfect_day",
    name: "Perfect Day",
    description: "Earn Daily Perfect once",
    icon: "⭐",
  },
  {
    id: "perfect_3",
    name: "3 Perfect Days",
    description: "Earn Daily Perfect on 3 different days",
    icon: "🌟",
  },
  {
    id: "weekly_consistency",
    name: "Weekly Consistency",
    description: "Complete habits on 5+ days in a week",
    icon: "📅",
  },
  {
    id: "comeback",
    name: "Comeback",
    description: "Complete a habit after missing 3+ days",
    icon: "🎯",
  },
];

/**
 * Initialize all badges in locked state
 */
export const initializeBadges = (): Badge[] => {
  return BADGE_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: false,
    unlockedAt: undefined,
  }));
};

/**
 * Get best streak across all habits
 */
const getBestStreak = (habits: Habit[], completions: Completion[]): number => {
  let maxStreak = 0;
  for (const habit of habits) {
    const streak = getCurrentStreak(habit.id, completions);
    if (streak > maxStreak) {
      maxStreak = streak;
    }
  }
  return maxStreak;
};

/**
 * Count unique days with Daily Perfect
 */
const countPerfectDays = (perfectDates: string[]): number => {
  return new Set(perfectDates).size;
};

/**
 * Count days with completions in the last 7 days
 */
const countDaysInLastWeek = (completions: Completion[]): number => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const uniqueDays = new Set<string>();
  completions.forEach((c) => {
    const compDate = new Date(c.date);
    if (compDate >= sevenDaysAgo && compDate <= today) {
      uniqueDays.add(c.date);
    }
  });

  return uniqueDays.size;
};

/**
 * Check if a habit was completed after a 3+ day gap
 */
const hasComeback = (habitId: string, completions: Completion[]): boolean => {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (let i = 1; i < habitCompletions.length; i++) {
    const prevDate = new Date(habitCompletions[i - 1].date);
    const currDate = new Date(habitCompletions[i].date);
    const daysDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff >= 4) {
      // missed 3+ days
      return true;
    }
  }
  return false;
};

export interface AchievementContext {
  habits: Habit[];
  completions: Completion[];
  currentBadges: Badge[];
  perfectDayDates: string[]; // dates when Daily Perfect was earned
}

/**
 * Evaluate all achievement conditions and return newly unlocked badges
 */
export const evaluateAchievements = (context: AchievementContext): Badge[] => {
  const { habits, completions, currentBadges, perfectDayDates } = context;
  const newlyUnlocked: Badge[] = [];
  const now = Date.now();

  // Helper to check if badge is already unlocked
  const isUnlocked = (badgeId: string) =>
    currentBadges.find((b) => b.id === badgeId)?.unlocked || false;

  // 1. First Step - complete any habit once
  if (!isUnlocked("first_step") && completions.length > 0) {
    newlyUnlocked.push({
      id: "first_step",
      name: "First Step",
      description: "Complete any habit once",
      icon: "👣",
      unlocked: true,
      unlockedAt: now,
    });
  }

  // 2. Streak badges (based on best streak)
  const bestStreak = getBestStreak(habits, completions);
  const streakBadges = [
    { id: "streak_3", threshold: 3, name: "3-Day Streak", icon: "🔥" },
    { id: "streak_7", threshold: 7, name: "Week Warrior", icon: "⚡" },
    { id: "streak_14", threshold: 14, name: "Two Weeks Strong", icon: "💪" },
    { id: "streak_30", threshold: 30, name: "Monthly Master", icon: "🏆" },
  ];

  for (const badge of streakBadges) {
    if (!isUnlocked(badge.id) && bestStreak >= badge.threshold) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === badge.id);
      if (def) {
        newlyUnlocked.push({
          ...def,
          unlocked: true,
          unlockedAt: now,
        });
      }
    }
  }

  // 3. Perfect Day badges
  const perfectDaysCount = countPerfectDays(perfectDayDates);
  if (!isUnlocked("perfect_day") && perfectDaysCount >= 1) {
    newlyUnlocked.push({
      id: "perfect_day",
      name: "Perfect Day",
      description: "Earn Daily Perfect once",
      icon: "⭐",
      unlocked: true,
      unlockedAt: now,
    });
  }

  if (!isUnlocked("perfect_3") && perfectDaysCount >= 3) {
    newlyUnlocked.push({
      id: "perfect_3",
      name: "3 Perfect Days",
      description: "Earn Daily Perfect on 3 different days",
      icon: "🌟",
      unlocked: true,
      unlockedAt: now,
    });
  }

  // 4. Weekly Consistency - 5+ days in last 7 days
  const daysInWeek = countDaysInLastWeek(completions);
  if (!isUnlocked("weekly_consistency") && daysInWeek >= 5) {
    newlyUnlocked.push({
      id: "weekly_consistency",
      name: "Weekly Consistency",
      description: "Complete habits on 5+ days in a week",
      icon: "📅",
      unlocked: true,
      unlockedAt: now,
    });
  }

  // 5. Comeback - complete after 3+ day gap
  const comeback = habits.some((h) => hasComeback(h.id, completions));
  if (!isUnlocked("comeback") && comeback) {
    newlyUnlocked.push({
      id: "comeback",
      name: "Comeback",
      description: "Complete a habit after missing 3+ days",
      icon: "🎯",
      unlocked: true,
      unlockedAt: now,
    });
  }

  return newlyUnlocked;
};

/**
 * Get next badge hint (what's close to unlocking)
 */
export const getNextBadgeHint = (
  context: AchievementContext
): string | null => {
  const { habits, completions, currentBadges, perfectDayDates } = context;

  const isUnlocked = (badgeId: string) =>
    currentBadges.find((b) => b.id === badgeId)?.unlocked || false;

  const bestStreak = getBestStreak(habits, completions);
  const perfectDaysCount = countPerfectDays(perfectDayDates);

  // Check streak badges
  if (!isUnlocked("streak_3") && bestStreak < 3) {
    return `${3 - bestStreak} more days for 3-Day Streak`;
  }
  if (!isUnlocked("streak_7") && bestStreak < 7) {
    return `${7 - bestStreak} more days for Week Warrior`;
  }
  if (!isUnlocked("streak_14") && bestStreak < 14) {
    return `${14 - bestStreak} more days for Two Weeks Strong`;
  }
  if (!isUnlocked("streak_30") && bestStreak < 30) {
    return `${30 - bestStreak} more days for Monthly Master`;
  }

  // Check perfect day badges
  if (!isUnlocked("perfect_day") && perfectDaysCount < 1) {
    return "Complete all habits in a day for Perfect Day";
  }
  if (!isUnlocked("perfect_3") && perfectDaysCount < 3) {
    return `${3 - perfectDaysCount} more perfect days for 3 Perfect Days`;
  }

  // Check weekly consistency
  const daysInWeek = countDaysInLastWeek(completions);
  if (!isUnlocked("weekly_consistency") && daysInWeek < 5) {
    return `${5 - daysInWeek} more days this week for Weekly Consistency`;
  }

  return null;
};
