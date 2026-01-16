import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Screen } from "../components/Screen";
import { useHabitsStore } from "../store/habits/habitsStore";
import { getTodayKey, formatDisplayDate } from "../services/time/dateService";

export const TodayScreen: React.FC = () => {
  const { habits, completions, toggleCompletion } = useHabitsStore();
  const today = getTodayKey();

  const isCompleted = (habitId: string) => {
    return completions.some((c) => c.habitId === habitId && c.date === today);
  };

  const handleToggle = (habitId: string) => {
    toggleCompletion(habitId, today);
  };

  const renderHabit = ({ item }: { item: (typeof habits)[0] }) => {
    const completed = isCompleted(item.id);

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
          <Text style={styles.habitName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.habitDescription}>{item.description}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.date}>{formatDisplayDate(today)}</Text>
      </View>

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
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 14,
    color: "#666",
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
