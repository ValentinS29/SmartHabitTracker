import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Screen } from "../components/Screen";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useHabitsStore } from "../store/habits/habitsStore";
import { useAuthStore } from "../store/auth/authStore";
import type { Difficulty } from "../types";
import { getDifficultyColor } from "../services/gamification/xpService";

interface AddEditHabitScreenProps {
  habitId?: string;
  onClose: () => void;
}

export const AddEditHabitScreen: React.FC<AddEditHabitScreenProps> = ({
  habitId,
  onClose,
}) => {
  const { habits, addHabit, updateHabit } = useHabitsStore();
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!habitId;
  const existingHabit = isEditing ? habits.find((h) => h.id === habitId) : null;

  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setDescription(existingHabit.description || "");
      setDifficulty(existingHabit.difficulty);
    }
  }, [existingHabit]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    if (!user) {
      Alert.alert("Error", "Not logged in");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && habitId) {
        updateHabit(habitId, name.trim(), description.trim(), difficulty);
      } else {
        addHabit(user.id, name.trim(), description.trim(), difficulty);
      }

      Alert.alert(
        "Success",
        isEditing ? "Habit updated successfully" : "Habit created successfully",
        [{ text: "OK", onPress: onClose }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save habit");
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyOptions: { value: Difficulty; label: string; xp: number }[] =
    [
      { value: "easy", label: "Easy", xp: 10 },
      { value: "medium", label: "Medium", xp: 15 },
      { value: "hard", label: "Hard", xp: 20 },
    ];

  return (
    <Screen scrollable={true}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? "Edit Habit" : "New Habit"}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Habit Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Morning meditation"
        />

        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add details about this habit"
        />

        <View style={styles.difficultySection}>
          <Text style={styles.difficultyLabel}>Difficulty</Text>
          <View style={styles.difficultyButtons}>
            {difficultyOptions.map((option) => {
              const isSelected = difficulty === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.difficultyButton,
                    isSelected && {
                      backgroundColor: getDifficultyColor(option.value),
                      borderColor: getDifficultyColor(option.value),
                    },
                  ]}
                  onPress={() => setDifficulty(option.value)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      isSelected && styles.difficultyButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.difficultyXP,
                      isSelected && styles.difficultyXPSelected,
                    ]}
                  >
                    +{option.xp} XP
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            disabled={isLoading}
          />
          <Button
            title={isEditing ? "Update" : "Create"}
            onPress={handleSave}
            loading={isLoading}
          />
        </View>
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
  form: {
    padding: 20,
    gap: 20,
  },
  difficultySection: {
    marginTop: 8,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  difficultyButtons: {
    flexDirection: "row",
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  difficultyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  difficultyButtonTextSelected: {
    color: "#fff",
  },
  difficultyXP: {
    fontSize: 12,
    color: "#666",
  },
  difficultyXPSelected: {
    color: "#fff",
    opacity: 0.9,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
});
