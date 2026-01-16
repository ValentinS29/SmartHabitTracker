import { create } from "zustand";
import { Habit, Completion } from "../../types";
import * as storageService from "../../services/storage/storageService";
import { generateId } from "../../utils/id";

interface HabitsState {
  habits: Habit[];
  completions: Completion[];
  isLoading: boolean;

  loadData: (userId: string) => Promise<void>;
  addHabit: (
    userId: string,
    name: string,
    description?: string
  ) => Promise<void>;
  updateHabit: (
    habitId: string,
    name: string,
    description?: string
  ) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completions: [],
  isLoading: false,

  loadData: async (userId: string) => {
    try {
      console.log("🏪 [HABITS STORE] Loading data for user:", userId);
      set({ isLoading: true });

      const habits = await storageService.loadHabits();
      const completions = await storageService.loadCompletions();

      // Filter habits by userId
      const userHabits = habits.filter((h) => h.userId === userId);

      set({ habits: userHabits, completions, isLoading: false });
      console.log(
        "✅ [HABITS STORE] Data loaded - Habits:",
        userHabits.length,
        "Completions:",
        completions.length
      );
    } catch (error: any) {
      console.error("❌ [HABITS STORE] Load error:", error.message);
      set({ isLoading: false });
    }
  },

  addHabit: async (userId: string, name: string, description?: string) => {
    try {
      console.log("🏪 [HABITS STORE] Adding habit:", name);
      const newHabit: Habit = {
        id: generateId(),
        userId,
        name,
        description,
        createdAt: new Date().toISOString(),
      };

      const updatedHabits = [...get().habits, newHabit];
      set({ habits: updatedHabits });
      await storageService.saveHabits(updatedHabits);
      console.log("✅ [HABITS STORE] Habit added:", newHabit.id);
    } catch (error: any) {
      console.error("❌ [HABITS STORE] Add habit error:", error.message);
    }
  },

  updateHabit: async (habitId: string, name: string, description?: string) => {
    try {
      console.log("🏪 [HABITS STORE] Updating habit:", habitId);
      const updatedHabits = get().habits.map((h) =>
        h.id === habitId ? { ...h, name, description } : h
      );

      set({ habits: updatedHabits });
      await storageService.saveHabits(updatedHabits);
      console.log("✅ [HABITS STORE] Habit updated");
    } catch (error: any) {
      console.error("❌ [HABITS STORE] Update habit error:", error.message);
    }
  },

  deleteHabit: async (habitId: string) => {
    try {
      console.log("🏪 [HABITS STORE] Deleting habit:", habitId);
      const updatedHabits = get().habits.filter((h) => h.id !== habitId);
      const updatedCompletions = get().completions.filter(
        (c) => c.habitId !== habitId
      );

      set({ habits: updatedHabits, completions: updatedCompletions });
      await storageService.saveHabits(updatedHabits);
      await storageService.saveCompletions(updatedCompletions);
      console.log("✅ [HABITS STORE] Habit deleted");
    } catch (error: any) {
      console.error("❌ [HABITS STORE] Delete habit error:", error.message);
    }
  },

  toggleCompletion: async (habitId: string, date: string) => {
    try {
      console.log("🏪 [HABITS STORE] Toggling completion:", habitId, date);
      const existingIndex = get().completions.findIndex(
        (c) => c.habitId === habitId && c.date === date
      );

      let updatedCompletions: Completion[];
      if (existingIndex >= 0) {
        // Remove completion
        updatedCompletions = get().completions.filter(
          (_, i) => i !== existingIndex
        );
        console.log("✅ [HABITS STORE] Completion removed");
      } else {
        // Add completion
        const newCompletion: Completion = {
          habitId,
          date,
          completedAt: new Date().toISOString(),
        };
        updatedCompletions = [...get().completions, newCompletion];
        console.log("✅ [HABITS STORE] Completion added");
      }

      set({ completions: updatedCompletions });
      await storageService.saveCompletions(updatedCompletions);
    } catch (error: any) {
      console.error(
        "❌ [HABITS STORE] Toggle completion error:",
        error.message
      );
    }
  },
}));
