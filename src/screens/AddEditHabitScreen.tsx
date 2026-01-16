import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Screen } from "../components/Screen";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useHabitsStore } from "../store/habits/habitsStore";
import { useAuthStore } from "../store/auth/authStore";
import type { Habit } from "../types";

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
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!habitId;
  const existingHabit = isEditing ? habits.find((h) => h.id === habitId) : null;

  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setDescription(existingHabit.description || "");
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
        updateHabit(habitId, name.trim(), description.trim());
      } else {
        addHabit(user.id, name.trim(), description.trim());
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
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
});
