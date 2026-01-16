import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit, Completion, User, Player, Badge, Quest } from "../../types";

const STORAGE_KEYS = {
  HABITS: "@smart_habit_tracker/habits:v2", // Phase 2: versioned
  COMPLETIONS: "@smart_habit_tracker/completions:v2", // Phase 2: versioned
  USER: "@smart_habit_tracker/user",
  PLAYER: "@smart_habit_tracker/player:v1", // Phase 2: new
  BADGES: "@smart_habit_tracker/badges:v1", // Phase 3: new
  QUESTS: "@smart_habit_tracker/quests:v1", // Phase 3: new
  PERFECT_DAYS: "@smart_habit_tracker/perfect_days:v1", // Phase 3: track Daily Perfect dates
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
  console.log("💾 [STORAGE] Saving habits:", habits.length);
  await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const loadHabits = async (): Promise<Habit[]> => {
  console.log("💾 [STORAGE] Loading habits");
  const data = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
  const habits = data ? JSON.parse(data) : [];
  console.log("💾 [STORAGE] Loaded habits:", habits.length);
  return habits;
};

export const saveCompletions = async (
  completions: Completion[]
): Promise<void> => {
  console.log("💾 [STORAGE] Saving completions:", completions.length);
  await AsyncStorage.setItem(
    STORAGE_KEYS.COMPLETIONS,
    JSON.stringify(completions)
  );
};

export const loadCompletions = async (): Promise<Completion[]> => {
  console.log("💾 [STORAGE] Loading completions");
  const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETIONS);
  const completions = data ? JSON.parse(data) : [];
  console.log("💾 [STORAGE] Loaded completions:", completions.length);
  return completions;
};

export const saveUser = async (user: User | null): Promise<void> => {
  console.log("💾 [STORAGE] Saving user:", user?.email || "None");
  if (user) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const loadUser = async (): Promise<User | null> => {
  console.log("💾 [STORAGE] Loading user");
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  const user = data ? JSON.parse(data) : null;
  console.log("💾 [STORAGE] Loaded user:", user?.email || "None");
  return user;
};

export const savePlayer = async (player: Player): Promise<void> => {
  console.log(
    "💾 [STORAGE] Saving player:",
    player.userId,
    "Level:",
    player.level
  );
  await AsyncStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
};

export const loadPlayer = async (userId: string): Promise<Player | null> => {
  console.log("💾 [STORAGE] Loading player for:", userId);
  const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER);
  const player = data ? JSON.parse(data) : null;

  // Verify the player belongs to this user
  if (player && player.userId !== userId) {
    console.log("💾 [STORAGE] Player userId mismatch, returning null");
    return null;
  }

  console.log(
    "💾 [STORAGE] Loaded player:",
    player ? `Level ${player.level}` : "None"
  );
  return player;
};

// Phase 3: Badges storage
export const saveBadges = async (
  userId: string,
  badges: Badge[]
): Promise<void> => {
  console.log("💾 [STORAGE] Saving badges:", badges.length);
  const key = `${STORAGE_KEYS.BADGES}:${userId}`;
  await AsyncStorage.setItem(key, JSON.stringify(badges));
};

export const loadBadges = async (userId: string): Promise<Badge[]> => {
  console.log("💾 [STORAGE] Loading badges for:", userId);
  const key = `${STORAGE_KEYS.BADGES}:${userId}`;
  const data = await AsyncStorage.getItem(key);
  const badges = data ? JSON.parse(data) : [];
  console.log("💾 [STORAGE] Loaded badges:", badges.length);
  return badges;
};

// Phase 3: Quests storage
export const saveQuests = async (
  userId: string,
  quests: Quest[]
): Promise<void> => {
  console.log("💾 [STORAGE] Saving quests:", quests.length);
  const key = `${STORAGE_KEYS.QUESTS}:${userId}`;
  await AsyncStorage.setItem(key, JSON.stringify(quests));
};

export const loadQuests = async (userId: string): Promise<Quest[]> => {
  console.log("💾 [STORAGE] Loading quests for:", userId);
  const key = `${STORAGE_KEYS.QUESTS}:${userId}`;
  const data = await AsyncStorage.getItem(key);
  const quests = data ? JSON.parse(data) : [];
  console.log("💾 [STORAGE] Loaded quests:", quests.length);
  return quests;
};

// Phase 3: Perfect Days tracking (for achievement evaluation)
export const savePerfectDays = async (
  userId: string,
  dates: string[]
): Promise<void> => {
  console.log("💾 [STORAGE] Saving perfect days:", dates.length);
  const key = `${STORAGE_KEYS.PERFECT_DAYS}:${userId}`;
  await AsyncStorage.setItem(key, JSON.stringify(dates));
};

export const loadPerfectDays = async (userId: string): Promise<string[]> => {
  console.log("💾 [STORAGE] Loading perfect days for:", userId);
  const key = `${STORAGE_KEYS.PERFECT_DAYS}:${userId}`;
  const data = await AsyncStorage.getItem(key);
  const dates = data ? JSON.parse(data) : [];
  console.log("💾 [STORAGE] Loaded perfect days:", dates.length);
  return dates;
};
