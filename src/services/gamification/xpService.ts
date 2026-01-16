import { Difficulty } from "../../types";

/**
 * XP values for each difficulty level
 */
export const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 10,
  medium: 15,
  hard: 20,
};

/**
 * Daily Perfect bonus XP (awarded when all habits are completed)
 */
export const DAILY_PERFECT_BONUS = 25;

/**
 * Calculate XP for completing a habit based on its difficulty
 */
export const calculateHabitXP = (difficulty: Difficulty): number => {
  return DIFFICULTY_XP[difficulty];
};

/**
 * Get display name for difficulty
 */
export const getDifficultyLabel = (difficulty: Difficulty): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

/**
 * Get difficulty badge color
 */
export const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case "easy":
      return "#34C759"; // Green
    case "medium":
      return "#FF9500"; // Orange
    case "hard":
      return "#FF3B30"; // Red
  }
};
