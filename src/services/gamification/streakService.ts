import { Completion } from "../../types";
import { getTodayKey, formatDateKey } from "../time/dateService";

/**
 * Get all completion dates for a specific habit, sorted chronologically
 */
export const getCompletionDates = (
  habitId: string,
  completions: Completion[]
): string[] => {
  return completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort();
};

/**
 * Check if a habit was completed on a specific date
 */
export const isCompletedOnDate = (
  habitId: string,
  dateKey: string,
  completions: Completion[]
): boolean => {
  return completions.some((c) => c.habitId === habitId && c.date === dateKey);
};

/**
 * Calculate the current streak for a habit.
 * Streak ends today (if completed today) or yesterday (to not penalize morning checks).
 */
export const getCurrentStreak = (
  habitId: string,
  completions: Completion[]
): number => {
  const dates = getCompletionDates(habitId, completions);
  if (dates.length === 0) return 0;

  const today = getTodayKey();
  const yesterday = getDateKeyDaysAgo(1);

  // Check if completed today or yesterday
  const lastCompletedDate = dates[dates.length - 1];

  // Streak is broken if last completion is older than yesterday
  if (lastCompletedDate < yesterday) {
    return 0;
  }

  // Count backwards from most recent completion
  let streak = 0;
  let currentDate = lastCompletedDate;

  for (let i = dates.length - 1; i >= 0; i--) {
    if (dates[i] === currentDate) {
      streak++;
      currentDate = getPreviousDateKey(currentDate);
    } else {
      // Gap found, stop counting
      break;
    }
  }

  return streak;
};

/**
 * Get date key for N days ago
 */
const getDateKeyDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateKey(date);
};

/**
 * Get the previous day's date key
 */
const getPreviousDateKey = (dateKey: string): string => {
  const date = new Date(dateKey);
  date.setDate(date.getDate() - 1);
  return formatDateKey(date);
};
