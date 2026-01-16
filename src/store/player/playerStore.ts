import { create } from "zustand";
import { Player, Badge, Quest } from "../../types";
import * as storageService from "../../services/storage/storageService";
import {
  computeLevelFromXP,
  getXPIntoLevel,
  getXPToNextLevel,
  getLevelProgress,
} from "../../services/gamification/levelService";

interface PlayerState extends Player {
  isLoading: boolean;
  perfectDayDates: string[]; // Phase 3: track dates for achievements
  badges: Badge[]; // Phase 3: stored separately but part of state
  quests: Quest[]; // Phase 3: stored separately but part of state

  // Derived values
  xpIntoLevel: number;
  xpToNextLevel: number;
  levelProgress: number;

  // Actions
  loadPlayer: (userId: string) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  removeXP: (amount: number) => Promise<void>;
  awardDailyPerfect: (dateKey: string) => Promise<void>;
  removeDailyPerfect: () => Promise<void>;

  // Phase 3: Badge actions
  unlockBadges: (newBadges: Badge[]) => Promise<void>;

  // Phase 3: Quest actions
  updateQuests: (quests: Quest[]) => Promise<void>;
  completeQuest: (questId: string, xpReward: number) => Promise<void>;

  resetPlayer: () => Promise<void>;
}

const createInitialPlayer = (userId: string): Player => ({
  userId,
  xpTotal: 0,
  level: 1,
  lastDailyPerfectDateKey: null,
});

export const usePlayerStore = create<PlayerState>((set, get) => ({
  userId: "",
  xpTotal: 0,
  level: 1,
  lastDailyPerfectDateKey: null,
  badges: [],
  quests: [],
  isLoading: false,
  perfectDayDates: [], // Phase 3

  // Derived values
  xpIntoLevel: 0,
  xpToNextLevel: 100,
  levelProgress: 0,

  loadPlayer: async (userId: string) => {
    try {
      console.log("🎮 [PLAYER STORE] Loading player for user:", userId);
      set({ isLoading: true });

      let player = await storageService.loadPlayer(userId);

      // Create new player if doesn't exist
      if (!player) {
        console.log("🎮 [PLAYER STORE] No player found, creating new");
        player = createInitialPlayer(userId);
        await storageService.savePlayer(player);
      }

      // Phase 3: Load badges, quests, and perfect day dates
      const badges = await storageService.loadBadges(userId);
      const quests = await storageService.loadQuests(userId);
      const perfectDayDates = await storageService.loadPerfectDays(userId);

      // Calculate derived values
      const level = computeLevelFromXP(player.xpTotal);
      const xpIntoLevel = getXPIntoLevel(player.xpTotal, level);
      const xpToNextLevel = getXPToNextLevel(player.xpTotal, level);
      const levelProgress = getLevelProgress(player.xpTotal, level);

      set({
        ...player,
        badges,
        quests,
        perfectDayDates,
        level,
        xpIntoLevel,
        xpToNextLevel,
        levelProgress,
        isLoading: false,
      });

      console.log(
        "✅ [PLAYER STORE] Player loaded - Level:",
        level,
        "XP:",
        player.xpTotal,
        "Badges:",
        badges.length,
        "Quests:",
        quests.length
      );
    } catch (error: any) {
      console.error("❌ [PLAYER STORE] Load error:", error.message);
      set({ isLoading: false });
    }
  },

  addXP: async (amount: number) => {
    try {
      const state = get();
      const newXpTotal = state.xpTotal + amount;
      const newLevel = computeLevelFromXP(newXpTotal);

      console.log(
        `🎮 [PLAYER STORE] Adding ${amount} XP (${state.xpTotal} → ${newXpTotal})`
      );

      // Calculate derived values
      const xpIntoLevel = getXPIntoLevel(newXpTotal, newLevel);
      const xpToNextLevel = getXPToNextLevel(newXpTotal, newLevel);
      const levelProgress = getLevelProgress(newXpTotal, newLevel);

      const updatedPlayer: Player = {
        userId: state.userId,
        xpTotal: newXpTotal,
        level: newLevel,
        lastDailyPerfectDateKey: state.lastDailyPerfectDateKey,
      };

      set({
        ...state,
        ...updatedPlayer,
        xpIntoLevel,
        xpToNextLevel,
        levelProgress,
      });

      await storageService.savePlayer(updatedPlayer);

      if (newLevel > state.level) {
        console.log(`🎉 [PLAYER STORE] LEVEL UP! ${state.level} → ${newLevel}`);
      }
    } catch (error: any) {
      console.error("❌ [PLAYER STORE] Add XP error:", error.message);
    }
  },

  removeXP: async (amount: number) => {
    try {
      const state = get();
      const newXpTotal = Math.max(0, state.xpTotal - amount);
      const newLevel = computeLevelFromXP(newXpTotal);

      console.log(
        `🎮 [PLAYER STORE] Removing ${amount} XP (${state.xpTotal} → ${newXpTotal})`
      );

      // Calculate derived values
      const xpIntoLevel = getXPIntoLevel(newXpTotal, newLevel);
      const xpToNextLevel = getXPToNextLevel(newXpTotal, newLevel);
      const levelProgress = getLevelProgress(newXpTotal, newLevel);

      const updatedPlayer: Player = {
        userId: state.userId,
        xpTotal: newXpTotal,
        level: newLevel,
        lastDailyPerfectDateKey: state.lastDailyPerfectDateKey,
      };

      set({
        ...state,
        ...updatedPlayer,
        xpIntoLevel,
        xpToNextLevel,
        levelProgress,
      });

      await storageService.savePlayer(updatedPlayer);
    } catch (error: any) {
      console.error("❌ [PLAYER STORE] Remove XP error:", error.message);
    }
  },

  awardDailyPerfect: async (dateKey: string) => {
    try {
      const state = get();

      // Only award once per day
      if (state.lastDailyPerfectDateKey === dateKey) {
        console.log("🎮 [PLAYER STORE] Daily Perfect already awarded today");
        return;
      }

      console.log("🎉 [PLAYER STORE] Daily Perfect bonus awarded!");

      // Phase 3: Track perfect day date for achievements
      const updatedPerfectDays = [...state.perfectDayDates];
      if (!updatedPerfectDays.includes(dateKey)) {
        updatedPerfectDays.push(dateKey);
        await storageService.savePerfectDays(state.userId, updatedPerfectDays);
      }

      const updatedPlayer: Player = {
        userId: state.userId,
        xpTotal: state.xpTotal,
        level: state.level,
        lastDailyPerfectDateKey: dateKey,
      };

      set({
        ...state,
        lastDailyPerfectDateKey: dateKey,
        perfectDayDates: updatedPerfectDays,
      });
      await storageService.savePlayer(updatedPlayer);

      // Add XP (will trigger recalculation)
      await get().addXP(25); // DAILY_PERFECT_BONUS
    } catch (error: any) {
      console.error(
        "❌ [PLAYER STORE] Award Daily Perfect error:",
        error.message
      );
    }
  },

  removeDailyPerfect: async () => {
    try {
      const state = get();

      if (!state.lastDailyPerfectDateKey) {
        return; // No bonus to remove
      }

      console.log("🎮 [PLAYER STORE] Removing Daily Perfect bonus");

      const updatedPlayer: Player = {
        userId: state.userId,
        xpTotal: state.xpTotal,
        level: state.level,
        lastDailyPerfectDateKey: null,
      };

      set({ ...state, lastDailyPerfectDateKey: null });
      await storageService.savePlayer(updatedPlayer);

      // Remove XP
      await get().removeXP(25); // DAILY_PERFECT_BONUS
    } catch (error: any) {
      console.error(
        "❌ [PLAYER STORE] Remove Daily Perfect error:",
        error.message
      );
    }
  },

  resetPlayer: async () => {
    try {
      const state = get();
      const newPlayer = createInitialPlayer(state.userId);

      set({
        ...newPlayer,
        xpIntoLevel: 0,
        xpToNextLevel: 100,
        levelProgress: 0,
      });

      await storageService.savePlayer(newPlayer);
      console.log("🎮 [PLAYER STORE] Player reset");
    } catch (error: any) {
      console.error("❌ [PLAYER STORE] Reset error:", error.message);
    }
  },

  // Phase 3: Badge management
  unlockBadges: async (newBadges: Badge[]) => {
    try {
      const state = get();
      const updatedBadges = [...state.badges];

      newBadges.forEach((newBadge) => {
        const existingIndex = updatedBadges.findIndex(
          (b) => b.id === newBadge.id
        );
        if (existingIndex >= 0) {
          updatedBadges[existingIndex] = newBadge;
        } else {
          updatedBadges.push(newBadge);
        }
      });

      set({ badges: updatedBadges });
      await storageService.saveBadges(state.userId, updatedBadges);

      console.log(`🏅 [PLAYER STORE] Unlocked ${newBadges.length} badge(s)`);
    } catch (error: any) {
      console.error("❌ [PLAYER STORE] Unlock badges error:", error.message);
    }
  },

  // Phase 3: Quest management
  updateQuests: async (quests: Quest[]) => {
    try {
      const state = get();
      set({ quests });
      await storageService.saveQuests(state.userId, quests);
      console.log(`✅ [PLAYER STORE] Updated quests: ${quests.length}`);
    } catch (error: any) {
      console.error("❌ [PLAYER STORE] Update quests error:", error.message);
    }
  },

  completeQuest: async (questId: string, xpReward: number) => {
    try {
      const state = get();
      const updatedQuests = state.quests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q
      );

      set({ quests: updatedQuests });
      await storageService.saveQuests(state.userId, updatedQuests);

      // Award XP
      await get().addXP(xpReward);

      console.log(`🎯 [PLAYER STORE] Quest completed: +${xpReward} XP`);
    } catch (error: any) {
      console.error("❌ [PLAYER STORE] Complete quest error:", error.message);
    }
  },
}));
