export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  difficulty: Difficulty; // Phase 2
  createdAt: string;
  archived?: boolean;
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completedAt: string; // ISO timestamp
  xpAwarded: number; // Phase 2
}

export interface Player {
  userId: string;
  xpTotal: number;
  level: number;
  lastDailyPerfectDateKey: string | null; // Phase 2: track daily perfect bonus
}
