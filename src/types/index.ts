export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  archived?: boolean;
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completedAt: string; // ISO timestamp
}
