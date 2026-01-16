import { create } from "zustand";
import { Habit, Completion, Difficulty, Badge, Quest } from "../../types";
import * as storageService from "../../services/storage/storageService";
import { generateId } from "../../utils/id";
import { calculateHabitXP } from "../../services/gamification/xpService";
import { evaluateAchievements } from "../../services/gamification/achievementService";
import { updateQuestProgress } from "../../services/gamification/questService";
import {
  applyBadgeReward,
  applyQuestReward,
} from "../../services/gamification/rewardService";

interface HabitsState {
  habits: Habit[];
  completions: Completion[];
  isLoading: boolean;

  loadData: (userId: string) => Promise<void>;
  addHabit: (
    userId: string,
    name: string,
    description?: string,
    difficulty?: Difficulty
  ) => Promise<void>;
  updateHabit: (
    habitId: string,
    name: string,
    description?: string,
    difficulty?: Difficulty
  ) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleCompletion: (
    habitId: string,
    date: string,
    onXPAwarded?: (xp: number) => void,
    onXPRemoved?: (xp: number) => void
  ) => Promise<void>;
  evaluateAchievementsAndQuests: (
    badges: Badge[],
    quests: Quest[],
    perfectDayDates: string[],
    onBadgesUnlocked?: (badges: Badge[], xp: number) => void,
    onQuestsUpdated?: (quests: Quest[], xp: number) => void
  ) => void;
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

      // Filter habits by userId and ensure difficulty field exists (Phase 2 migration)
      const userHabits = habits
        .filter((h) => h.userId === userId)
        .map((h) => ({
          ...h,
          difficulty: h.difficulty || "easy", // Default to easy for Phase 1 habits
        }));

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

  addHabit: async (
    userId: string,
    name: string,
    description?: string,
    difficulty: Difficulty = "easy"
  ) => {
    try {
      console.log(
        "🏪 [HABITS STORE] Adding habit:",
        name,
        "Difficulty:",
        difficulty
      );
      const newHabit: Habit = {
        id: generateId(),
        userId,
        name,
        description,
        difficulty, // Phase 2
        createdAt: new Date().toISOString(),
      };

      const updatedHabits = [...get().habits, newHabit];
      set({ habits: updatedHabits });
      await storageService.saveHabits(updatedHabits);
      console.log("✅ [HABITS STORE] Habit added successfully");
    } catch (error) {
      console.error("❌ [HABITS STORE] Failed to add habit:", error);
    }
  },

  updateHabit: async (
    habitId: string,
    name: string,
    description?: string,
    difficulty?: Difficulty
  ) => {
    try {
      console.log("🏪 [HABITS STORE] Updating habit:", habitId);
      const updatedHabits = get().habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              name,
              description,
              ...(difficulty && { difficulty }), // Only update if provided
            }
          : h
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

  toggleCompletion: async (
    habitId: string,
    date: string,
    onXPAwarded?: (xp: number) => void,
    onXPRemoved?: (xp: number) => void
  ) => {
    try {
      console.log("🏪 [HABITS STORE] Toggling completion:", habitId, date);
      const existingIndex = get().completions.findIndex(
        (c) => c.habitId === habitId && c.date === date
      );

      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) {
        console.error("❌ [HABITS STORE] Habit not found:", habitId);
        return;
      }

      let updatedCompletions: Completion[];
      if (existingIndex >= 0) {
        // Remove completion - undo XP
        const removedCompletion = get().completions[existingIndex];
        const xpToRemove = removedCompletion.xpAwarded || 0;

        updatedCompletions = get().completions.filter(
          (_, i) => i !== existingIndex
        );
        console.log("✅ [HABITS STORE] Completion removed, XP:", xpToRemove);

        if (onXPRemoved && xpToRemove > 0) {
          onXPRemoved(xpToRemove);
        }
      } else {
        // Add completion - award XP
        const xpAwarded = calculateHabitXP(habit.difficulty);
        const newCompletion: Completion = {
          habitId,
          date,
          completedAt: new Date().toISOString(),
          xpAwarded, // Phase 2
        };
        updatedCompletions = [...get().completions, newCompletion];
        console.log(
          "✅ [HABITS STORE] Completion added, XP awarded:",
          xpAwarded
        );

        if (onXPAwarded) {
          onXPAwarded(xpAwarded);
        }
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

  evaluateAchievementsAndQuests: (
    badges: Badge[],
    quests: Quest[],
    perfectDayDates: string[],
    onBadgesUnlocked?: (badges: Badge[], xp: number) => void,
    onQuestsUpdated?: (quests: Quest[], xp: number) => void
  ) => {
    try {
      const { habits, completions } = get();

      // Evaluate achievements
      const newlyUnlockedBadges = evaluateAchievements({
        habits,
        completions,
        currentBadges: badges,
        perfectDayDates,
      });

      if (newlyUnlockedBadges.length > 0) {
        const badgeXP = newlyUnlockedBadges.reduce(
          (total, badge) => total + applyBadgeReward(badge, badges),
          0
        );
        console.log(
          "🎖️ [HABITS STORE] Badges unlocked:",
          newlyUnlockedBadges.map((b) => b.name).join(", "),
          "XP:",
          badgeXP
        );
        if (onBadgesUnlocked) {
          onBadgesUnlocked(newlyUnlockedBadges, badgeXP);
        }
      }

      // Update quest progress
      const today = new Date().toISOString().split("T")[0];
      const updatedQuests = updateQuestProgress(
        quests,
        habits,
        completions,
        today
      );

      // Check for newly completed quests
      const newlyCompletedQuests = updatedQuests.filter((uq) => {
        const original = quests.find((q) => q.id === uq.id);
        return uq.completed && original && !original.completed;
      });

      // Check for newly uncompleted quests (when user undoes)
      const newlyUncompletedQuests = updatedQuests.filter((uq) => {
        const original = quests.find((q) => q.id === uq.id);
        return !uq.completed && original && original.completed;
      });

      let questXPChange = 0;

      if (newlyCompletedQuests.length > 0) {
        const questXP = newlyCompletedQuests.reduce(
          (total, quest) => total + applyQuestReward(quest),
          0
        );
        questXPChange += questXP;
        console.log(
          "🎯 [HABITS STORE] Quests completed:",
          newlyCompletedQuests.map((q) => q.title).join(", "),
          "XP:",
          questXP
        );
      }

      if (newlyUncompletedQuests.length > 0) {
        const questXP = newlyUncompletedQuests.reduce(
          (total, quest) => total + quest.rewardXp,
          0
        );
        questXPChange -= questXP;
        console.log(
          "↩️ [HABITS STORE] Quests uncompleted:",
          newlyUncompletedQuests.map((q) => q.title).join(", "),
          "XP removed:",
          questXP
        );
      }

      if (
        newlyCompletedQuests.length > 0 ||
        newlyUncompletedQuests.length > 0
      ) {
        if (onQuestsUpdated) {
          onQuestsUpdated(updatedQuests, questXPChange);
        }
      } else if (JSON.stringify(updatedQuests) !== JSON.stringify(quests)) {
        // Quest progress changed but none completed/uncompleted
        if (onQuestsUpdated) {
          onQuestsUpdated(updatedQuests, 0);
        }
      }
    } catch (error: any) {
      console.error(
        "❌ [HABITS STORE] Achievement/Quest evaluation error:",
        error.message
      );
    }
  },
}));
