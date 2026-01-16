import { Quest, Habit, Completion } from "../../types";
import { generateId } from "../../utils/id";

// Quest templates (Phase 3)
interface QuestTemplate {
  id: string;
  type: "daily" | "weekly";
  title: string;
  description: string;
  target: number;
  rewardXp: number;
  evaluator: (
    habits: Habit[],
    completions: Completion[],
    dateKey: string
  ) => number;
}

const DAILY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: "complete_2_habits",
    type: "daily",
    title: "Complete 2 habits today",
    description: "Finish any 2 habits",
    target: 2,
    rewardXp: 10,
    evaluator: (habits, completions, dateKey) => {
      return completions.filter((c) => c.date === dateKey).length;
    },
  },
  {
    id: "complete_3_habits",
    type: "daily",
    title: "Complete 3 habits today",
    description: "Finish any 3 habits",
    target: 3,
    rewardXp: 15,
    evaluator: (habits, completions, dateKey) => {
      return completions.filter((c) => c.date === dateKey).length;
    },
  },
  {
    id: "complete_5_habits",
    type: "daily",
    title: "Complete 5 habits today",
    description: "Finish any 5 habits",
    target: 5,
    rewardXp: 25,
    evaluator: (habits, completions, dateKey) => {
      return completions.filter((c) => c.date === dateKey).length;
    },
  },
  {
    id: "daily_perfect",
    type: "daily",
    title: "Get a Daily Perfect",
    description: "Complete all your habits today",
    target: 1,
    rewardXp: 25,
    evaluator: (habits, completions, dateKey) => {
      if (habits.length === 0) return 0;
      const todayCompletions = completions.filter((c) => c.date === dateKey);
      const allCompleted = habits.every((h) =>
        todayCompletions.some((c) => c.habitId === h.id)
      );
      return allCompleted ? 1 : 0;
    },
  },
  {
    id: "maintain_streak",
    type: "daily",
    title: "Maintain a 3-day streak",
    description: "Keep any habit streak at 3+ days",
    target: 1,
    rewardXp: 20,
    evaluator: (habits, completions, dateKey) => {
      const todayCompletions = completions.filter((c) => c.date === dateKey);
      for (const completion of todayCompletions) {
        const habitCompletions = completions.filter(
          (c) => c.habitId === completion.habitId
        );
        if (habitCompletions.length >= 3) {
          return 1;
        }
      }
      return 0;
    },
  },
  {
    id: "early_bird",
    type: "daily",
    title: "Early Bird",
    description: "Complete a habit before noon",
    target: 1,
    rewardXp: 15,
    evaluator: (habits, completions, dateKey) => {
      const todayCompletions = completions.filter((c) => c.date === dateKey);
      for (const completion of todayCompletions) {
        const completedTime = new Date(completion.completedAt);
        if (completedTime.getHours() < 12) {
          return 1;
        }
      }
      return 0;
    },
  },
  {
    id: "hard_mode",
    type: "daily",
    title: "Hard Mode",
    description: "Complete a hard difficulty habit",
    target: 1,
    rewardXp: 20,
    evaluator: (habits, completions, dateKey) => {
      const todayCompletions = completions.filter((c) => c.date === dateKey);
      for (const completion of todayCompletions) {
        const habit = habits.find((h) => h.id === completion.habitId);
        if (habit && habit.difficulty === "hard") {
          return 1;
        }
      }
      return 0;
    },
  },
];

const WEEKLY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: "weekly_warrior",
    type: "weekly",
    title: "Weekly Warrior",
    description: "Complete habits on 5 different days this week",
    target: 5,
    rewardXp: 50,
    evaluator: (habits, completions, weekKey) => {
      // Count unique dates in current week
      const weekDates = new Set<string>();
      const weekStart = getWeekStart(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      completions.forEach((c) => {
        const compDate = new Date(c.date);
        if (compDate >= weekStart && compDate < weekEnd) {
          weekDates.add(c.date);
        }
      });

      return weekDates.size;
    },
  },
  {
    id: "consistency_champion",
    type: "weekly",
    title: "Consistency Champion",
    description: "Complete at least one habit every day this week",
    target: 7,
    rewardXp: 75,
    evaluator: (habits, completions, weekKey) => {
      const weekDates = new Set<string>();
      const weekStart = getWeekStart(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      completions.forEach((c) => {
        const compDate = new Date(c.date);
        if (compDate >= weekStart && compDate < weekEnd) {
          weekDates.add(c.date);
        }
      });

      return weekDates.size;
    },
  },
  {
    id: "habit_master",
    type: "weekly",
    title: "Habit Master",
    description: "Complete 20 habits this week",
    target: 20,
    rewardXp: 60,
    evaluator: (habits, completions, weekKey) => {
      const weekStart = getWeekStart(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      return completions.filter((c) => {
        const compDate = new Date(c.date);
        return compDate >= weekStart && compDate < weekEnd;
      }).length;
    },
  },
  {
    id: "perfect_week",
    type: "weekly",
    title: "Perfect Week",
    description: "Achieve Daily Perfect 3 times this week",
    target: 3,
    rewardXp: 100,
    evaluator: (habits, completions, weekKey) => {
      if (habits.length === 0) return 0;

      const weekStart = getWeekStart(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Group completions by date
      const dateGroups = new Map<string, Set<string>>();
      completions.forEach((c) => {
        const compDate = new Date(c.date);
        if (compDate >= weekStart && compDate < weekEnd) {
          if (!dateGroups.has(c.date)) {
            dateGroups.set(c.date, new Set());
          }
          dateGroups.get(c.date)!.add(c.habitId);
        }
      });

      // Count perfect days
      let perfectDays = 0;
      dateGroups.forEach((habitIds) => {
        if (habitIds.size === habits.length) {
          perfectDays++;
        }
      });

      return perfectDays;
    },
  },
];

// Helper to get week start date from week key (YYYY-WW format)
const getWeekStart = (weekKey: string): Date => {
  const [year, week] = weekKey.split("-").map(Number);
  const jan4 = new Date(year, 0, 4);
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - jan4.getDay() + 1 + (week - 1) * 7);
  return weekStart;
};

// Helper to get current week key
const getCurrentWeekKey = (): string => {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const daysDiff = Math.floor(
    (now.getTime() - jan4.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weekNum = Math.ceil((daysDiff + jan4.getDay() + 1) / 7);
  return `${now.getFullYear()}-${String(weekNum).padStart(2, "0")}`;
};

/**
 * Generate daily quests for a specific date
 * Returns 2-3 quests from templates
 */
export const generateDailyQuests = (
  dateKey: string,
  habits: Habit[]
): Quest[] => {
  const quests: Quest[] = [];

  // Determine quest based on habit count
  if (habits.length >= 5) {
    // For users with 5+ habits, give the "5 habits" quest
    const template = DAILY_QUEST_TEMPLATES.find(
      (t) => t.id === "complete_5_habits"
    );
    if (template) {
      quests.push({
        id: generateId(),
        type: "daily",
        dateKey,
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        completed: false,
        rewardXp: template.rewardXp,
      });
    }
  } else if (habits.length >= 3) {
    // For users with 3-4 habits
    const template = DAILY_QUEST_TEMPLATES.find(
      (t) => t.id === "complete_3_habits"
    );
    if (template) {
      quests.push({
        id: generateId(),
        type: "daily",
        dateKey,
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        completed: false,
        rewardXp: template.rewardXp,
      });
    }
  } else if (habits.length >= 2) {
    // For users with 2 habits
    const template = DAILY_QUEST_TEMPLATES.find(
      (t) => t.id === "complete_2_habits"
    );
    if (template) {
      quests.push({
        id: generateId(),
        type: "daily",
        dateKey,
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        completed: false,
        rewardXp: template.rewardXp,
      });
    }
  }

  // Always add "Daily Perfect" quest if user has habits
  if (habits.length > 0) {
    const template = DAILY_QUEST_TEMPLATES.find(
      (t) => t.id === "daily_perfect"
    );
    if (template) {
      quests.push({
        id: generateId(),
        type: "daily",
        dateKey,
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        completed: false,
        rewardXp: template.rewardXp,
      });
    }
  }

  // Add one random bonus quest
  const bonusQuests = ["maintain_streak", "early_bird", "hard_mode"];
  const randomBonus =
    bonusQuests[Math.floor(Math.random() * bonusQuests.length)];
  const template = DAILY_QUEST_TEMPLATES.find((t) => t.id === randomBonus);
  if (template && habits.length > 0) {
    quests.push({
      id: generateId(),
      type: "daily",
      dateKey,
      title: template.title,
      description: template.description,
      target: template.target,
      progress: 0,
      completed: false,
      rewardXp: template.rewardXp,
    });
  }

  return quests;
};

/**
 * Generate weekly quests for the current week
 * Returns 2-3 quests from templates
 */
export const generateWeeklyQuests = (habits: Habit[]): Quest[] => {
  const quests: Quest[] = [];
  const weekKey = getCurrentWeekKey();

  if (habits.length === 0) return quests;

  // Always include "Weekly Warrior" (5 days)
  const weeklyWarrior = WEEKLY_QUEST_TEMPLATES.find(
    (t) => t.id === "weekly_warrior"
  );
  if (weeklyWarrior) {
    quests.push({
      id: generateId(),
      type: "weekly",
      dateKey: weekKey,
      title: weeklyWarrior.title,
      description: weeklyWarrior.description,
      target: weeklyWarrior.target,
      progress: 0,
      completed: false,
      rewardXp: weeklyWarrior.rewardXp,
    });
  }

  // Add "Habit Master" if user has multiple habits
  if (habits.length >= 2) {
    const habitMaster = WEEKLY_QUEST_TEMPLATES.find(
      (t) => t.id === "habit_master"
    );
    if (habitMaster) {
      quests.push({
        id: generateId(),
        type: "weekly",
        dateKey: weekKey,
        title: habitMaster.title,
        description: habitMaster.description,
        target: habitMaster.target,
        progress: 0,
        completed: false,
        rewardXp: habitMaster.rewardXp,
      });
    }
  }

  // Randomly add either "Consistency Champion" or "Perfect Week"
  const challengeQuests = ["consistency_champion", "perfect_week"];
  const randomChallenge =
    challengeQuests[Math.floor(Math.random() * challengeQuests.length)];
  const template = WEEKLY_QUEST_TEMPLATES.find((t) => t.id === randomChallenge);
  if (template) {
    quests.push({
      id: generateId(),
      type: "weekly",
      dateKey: weekKey,
      title: template.title,
      description: template.description,
      target: template.target,
      progress: 0,
      completed: false,
      rewardXp: template.rewardXp,
    });
  }

  return quests;
};

/**
 * Update quest progress based on current game state
 * Returns updated quests array
 */
export const updateQuestProgress = (
  quests: Quest[],
  habits: Habit[],
  completions: Completion[],
  dateKey: string
): Quest[] => {
  return quests.map((quest) => {
    // Find matching template to evaluate progress
    const allTemplates = [...DAILY_QUEST_TEMPLATES, ...WEEKLY_QUEST_TEMPLATES];
    const template = allTemplates.find((t) =>
      quest.title.toLowerCase().includes(t.title.toLowerCase().split(" ")[0])
    );

    if (!template) {
      return quest;
    }

    const newProgress = template.evaluator(habits, completions, quest.dateKey);
    const completed = newProgress >= quest.target;

    return {
      ...quest,
      progress: newProgress,
      completed,
    };
  });
};

/**
 * Check if quest was just completed (progress reached target)
 * Returns array of newly completed quest IDs
 */
export const checkQuestCompletion = (
  oldQuests: Quest[],
  newQuests: Quest[]
): string[] => {
  const newlyCompleted: string[] = [];

  newQuests.forEach((newQuest) => {
    const oldQuest = oldQuests.find((q) => q.id === newQuest.id);
    if (oldQuest && !oldQuest.completed && newQuest.completed) {
      newlyCompleted.push(newQuest.id);
    }
  });

  return newlyCompleted;
};

/**
 * Get active quests for today (daily quests) or current week (weekly quests)
 */
export const getActiveQuests = (quests: Quest[], dateKey: string): Quest[] => {
  const weekKey = getCurrentWeekKey();
  return quests.filter(
    (q) =>
      q.dateKey === dateKey || (q.type === "weekly" && q.dateKey === weekKey)
  );
};

/**
 * Get current week key for weekly quest tracking
 */
export const getWeekKey = (): string => {
  return getCurrentWeekKey();
};

/**
 * Check if weekly quests need to be generated for current week
 */
export const needsWeeklyQuests = (quests: Quest[]): boolean => {
  const currentWeek = getCurrentWeekKey();
  return !quests.some((q) => q.type === "weekly" && q.dateKey === currentWeek);
};

/**
 * Clean up old quests (remove quests older than 7 days, except current week's weekly quests)
 */
export const cleanupOldQuests = (quests: Quest[]): Quest[] => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const year = sevenDaysAgo.getFullYear();
  const month = String(sevenDaysAgo.getMonth() + 1).padStart(2, "0");
  const day = String(sevenDaysAgo.getDate()).padStart(2, "0");
  const cutoffDate = `${year}-${month}-${day}`;
  const currentWeek = getCurrentWeekKey();

  return quests.filter((q) => {
    // Keep current week's weekly quests
    if (q.type === "weekly" && q.dateKey === currentWeek) {
      return true;
    }
    // Keep recent quests
    return q.dateKey >= cutoffDate;
  });
};
