import { create } from "zustand";
import { Player } from "../../types";
import * as storageService from "../../services/storage/storageService";
import {
  computeLevelFromXP,
  getXPIntoLevel,
  getXPToNextLevel,
  getLevelProgress,
} from "../../services/gamification/levelService";

interface PlayerState extends Player {
  isLoading: boolean;

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
  isLoading: false,

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

      // Calculate derived values
      const level = computeLevelFromXP(player.xpTotal);
      const xpIntoLevel = getXPIntoLevel(player.xpTotal, level);
      const xpToNextLevel = getXPToNextLevel(player.xpTotal, level);
      const levelProgress = getLevelProgress(player.xpTotal, level);

      set({
        ...player,
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
        player.xpTotal
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

      const updatedPlayer: Player = {
        ...state,
        lastDailyPerfectDateKey: dateKey,
      };

      set({ lastDailyPerfectDateKey: dateKey });
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
        ...state,
        lastDailyPerfectDateKey: null,
      };

      set({ lastDailyPerfectDateKey: null });
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
}));
