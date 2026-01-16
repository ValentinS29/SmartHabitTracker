import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { useHabitsStore } from "../store/habits/habitsStore";

interface HabitsScreenProps {
  onAddHabit: () => void;
  onEditHabit: (habitId: string) => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  onAddHabit,
  onEditHabit,
}) => {
  const { habits, deleteHabit } = useHabitsStore();

  const handleDelete = (habitId: string, habitName: string) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habitName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteHabit(habitId),
        },
      ]
    );
  };

  const renderHabit = ({ item }: { item: (typeof habits)[0] }) => {
    return (
      <View style={styles.habitItem}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.habitDescription}>{item.description}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEditHabit(item.id)}
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No habits yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first habit to start building better routines
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

      <View style={styles.footer}>
        <Button title="Add Habit" onPress={onAddHabit} />
      </View>
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
  },
  list: {
    padding: 20,
  },
  habitItem: {
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: 12,
  },
  habitInfo: {
    marginBottom: 12,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  deleteText: {
    color: "#fff",
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
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
});
