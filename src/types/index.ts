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

// Phase 3: Achievements
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  unlocked: boolean;
  unlockedAt?: number; // timestamp
}

// Phase 3: Quests/Challenges
export interface Quest {
  id: string;
  type: string; // "daily" | "weekly"
  dateKey: string; // YYYY-MM-DD or YYYY-WW
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardXp: number;
}

export interface Player {
  userId: string;
  xpTotal: number;
  level: number;
  lastDailyPerfectDateKey: string | null; // Phase 2: track daily perfect bonus
  // Note: badges and quests are stored separately, not in Player object
}
