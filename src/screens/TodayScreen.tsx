import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Screen } from "../components/Screen";
import { useHabitsStore } from "../store/habits/habitsStore";
import { usePlayerStore } from "../store/player/playerStore";
import { getTodayKey, formatDisplayDate } from "../services/time/dateService";
import { getCurrentStreak } from "../services/gamification/streakService";
import {
  getDifficultyLabel,
  getDifficultyColor,
} from "../services/gamification/xpService";

export const TodayScreen: React.FC = () => {
  const { habits, completions, toggleCompletion } = useHabitsStore();
  const {
    addXP,
    removeXP,
    awardDailyPerfect,
    removeDailyPerfect,
    lastDailyPerfectDateKey,
  } = usePlayerStore();
  const [showDailyPerfect, setShowDailyPerfect] = useState(false);
  const today = getTodayKey();

  const isCompleted = (habitId: string) => {
    return completions.some((c) => c.habitId === habitId && c.date === today);
  };

  const completedCount = habits.filter((h) => isCompleted(h.id)).length;
  const allCompleted = habits.length > 0 && completedCount === habits.length;

  // Check for Daily Perfect
  useEffect(() => {
    if (allCompleted && lastDailyPerfectDateKey !== today) {
      // Award Daily Perfect
      awardDailyPerfect(today);
      setShowDailyPerfect(true);
      setTimeout(() => setShowDailyPerfect(false), 3000);
    } else if (!allCompleted && lastDailyPerfectDateKey === today) {
      // Remove Daily Perfect if it was awarded today but user undid a completion
      removeDailyPerfect();
    }
  }, [allCompleted, today, lastDailyPerfectDateKey]);

  const handleToggle = (habitId: string) => {
    toggleCompletion(
      habitId,
      today,
      (xp) => addXP(xp), // onXPAwarded
      (xp) => removeXP(xp) // onXPRemoved
    );
  };

  const renderHabit = ({ item }: { item: (typeof habits)[0] }) => {
    const completed = isCompleted(item.id);
    const streak = getCurrentStreak(item.id, completions);

    return (
      <TouchableOpacity
        style={styles.habitItem}
        onPress={() => handleToggle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.checkbox}>
          {completed && <View style={styles.checkboxChecked} />}
        </View>
        <View style={styles.habitInfo}>
          <View style={styles.habitHeader}>
            <Text style={styles.habitName}>{item.name}</Text>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>
                {getDifficultyLabel(item.difficulty)}
              </Text>
            </View>
          </View>
          {item.description && (
            <Text style={styles.habitDescription}>{item.description}</Text>
          )}
          <Text style={styles.streakText}>🔥 Streak: {streak}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.date}>{formatDisplayDate(today)}</Text>
        {habits.length > 0 && (
          <Text style={styles.progress}>
            {completedCount} / {habits.length} completed
          </Text>
        )}
      </View>

      {showDailyPerfect && (
        <View style={styles.dailyPerfectBanner}>
          <Text style={styles.dailyPerfectText}>🎉 Daily Perfect! +25 XP</Text>
        </View>
      )}

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No habits yet</Text>
          <Text style={styles.emptySubtext}>
            Add habits in the Habits tab to start tracking
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabit}
          contentContainerStyle={styles.list}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#666",
  },
  progress: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 8,
    fontWeight: "600",
  },
  dailyPerfectBanner: {
    backgroundColor: "#34C759",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  dailyPerfectText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  list: {
    padding: 20,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  habitInfo: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  habitDescription: {
    fontSize: 14,
    color: "#666",
  },
  streakText: {
    fontSize: 12,
    color: "#FF9500",
    marginTop: 4,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
    textAlign: "center",
  },
});
