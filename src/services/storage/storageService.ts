import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit, Completion, User, Player } from "../../types";

const STORAGE_KEYS = {
  HABITS: "@smart_habit_tracker/habits:v2", // Phase 2: versioned
  COMPLETIONS: "@smart_habit_tracker/completions:v2", // Phase 2: versioned
  USER: "@smart_habit_tracker/user",
  PLAYER: "@smart_habit_tracker/player:v1", // Phase 2: new
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
