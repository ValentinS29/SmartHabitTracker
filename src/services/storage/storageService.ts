import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit, Completion, User } from "../../types";

const STORAGE_KEYS = {
  HABITS: "@smart_habit_tracker/habits",
  COMPLETIONS: "@smart_habit_tracker/completions",
  USER: "@smart_habit_tracker/user",
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
