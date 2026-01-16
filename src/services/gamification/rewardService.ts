import { Badge, Quest } from "../../types";

// Badge XP rewards (one-time bonuses)
const BADGE_XP_REWARDS: Record<string, number> = {
  first_step: 25,
  streak_3: 30,
  streak_7: 50,
  streak_14: 75,
  streak_30: 100,
  perfect_day: 25,
  perfect_3: 50,
  weekly_consistency: 40,
  comeback: 35,
};

/**
 * Get XP reward for unlocking a badge
 */
export const getBadgeReward = (badgeId: string): number => {
  return BADGE_XP_REWARDS[badgeId] || 0;
};

/**
 * Apply badge unlock reward (returns XP to award)
 * Policy: Badges give XP only once when unlocked
 */
export const applyBadgeReward = (
  badge: Badge,
  alreadyUnlockedBadges: Badge[]
): number => {
  // Check if badge was already unlocked (prevent duplicates)
  const wasAlreadyUnlocked = alreadyUnlockedBadges.some(
    (b) => b.id === badge.id && b.unlocked
  );

  if (wasAlreadyUnlocked) {
    console.log(`⚠️ [REWARD] Badge ${badge.id} already unlocked, no XP`);
    return 0;
  }

  const xpReward = getBadgeReward(badge.id);
  console.log(`🏅 [REWARD] Badge "${badge.name}" unlocked! +${xpReward} XP`);
  return xpReward;
};

/**
 * Apply quest completion reward (returns XP to award)
 * Policy: Quest gives XP only when marked completed
 */
export const applyQuestReward = (quest: Quest): number => {
  if (!quest.completed) {
    console.log(`⚠️ [REWARD] Quest ${quest.id} not completed, no XP`);
    return 0;
  }

  console.log(
    `✅ [REWARD] Quest "${quest.title}" completed! +${quest.rewardXp} XP`
  );
  return quest.rewardXp;
};

/**
 * Calculate total XP from multiple badge unlocks
 */
export const calculateBadgeXP = (newBadges: Badge[]): number => {
  return newBadges.reduce((total, badge) => {
    return total + getBadgeReward(badge.id);
  }, 0);
};

/**
 * Calculate total XP from multiple quest completions
 */
export const calculateQuestXP = (completedQuests: Quest[]): number => {
  return completedQuests.reduce((total, quest) => {
    return total + (quest.completed ? quest.rewardXp : 0);
  }, 0);
};
