import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { TodayScreen } from "./src/screens/TodayScreen";
import { HabitsScreen } from "./src/screens/HabitsScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { RewardsScreen } from "./src/screens/RewardsScreen";
import { AddEditHabitScreen } from "./src/screens/AddEditHabitScreen";
import { useAuthStore } from "./src/store/auth/authStore";
import { useHabitsStore } from "./src/store/habits/habitsStore";
import { usePlayerStore } from "./src/store/player/playerStore";
import { initializeBadges } from "./src/services/gamification/achievementService";
import {
  generateDailyQuests,
  generateWeeklyQuests,
  needsWeeklyQuests,
  cleanupOldQuests,
} from "./src/services/gamification/questService";

export default function App() {
  const { initialize, isLoading, user } = useAuthStore();
  const { loadData, habits } = useHabitsStore();
  const { loadPlayer, badges, quests, unlockBadges, updateQuests } =
    usePlayerStore();
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | undefined>();

  useEffect(() => {
    console.log("🧭 [APP] App starting - initializing auth");
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("🧭 [APP] User logged in, loading habits and player data");
      loadData(user.id);
      loadPlayer(user.id); // Phase 2
    }
  }, [user]);

  // Phase 3: Initialize badges and quests after player loads
  useEffect(() => {
    if (user && badges.length === 0 && habits.length >= 0) {
      console.log("🎮 [APP] Initializing badges for first time");
      const initialBadges = initializeBadges();
      unlockBadges(initialBadges);
    }
  }, [user, badges.length, habits.length]);

  // Phase 3: Generate daily quests if needed
  useEffect(() => {
    if (user && habits.length > 0) {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Check if we need to generate daily quests
      const hasTodayQuests = quests.some(
        (q) => q.type === "daily" && q.dateKey === dateKey
      );

      if (!hasTodayQuests) {
        console.log("🎯 [APP] Generating daily quests for", dateKey);
        const dailyQuests = generateDailyQuests(dateKey, habits);
        updateQuests([...quests, ...dailyQuests]);
      }

      // Check if we need to generate weekly quests
      if (needsWeeklyQuests(quests)) {
        console.log("📅 [APP] Generating weekly quests");
        const weeklyQuests = generateWeeklyQuests(habits);
        updateQuests([...quests, ...weeklyQuests]);
      }

      // Cleanup old quests
      const cleanedQuests = cleanupOldQuests(quests);
      if (cleanedQuests.length !== quests.length) {
        console.log("🧹 [APP] Cleaning up old quests");
        updateQuests(cleanedQuests);
      }
    }
  }, [user, habits.length, quests.length]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleAddHabit = () => {
    setEditingHabitId(undefined);
    setShowAddEditModal(true);
  };

  const handleEditHabit = (habitId: string) => {
    setEditingHabitId(habitId);
    setShowAddEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddEditModal(false);
    setEditingHabitId(undefined);
  };

  // Show main app when logged in
  if (user) {
    return (
      <View style={styles.appContainer}>
        <View style={styles.content}>
          {activeTab === "today" && <TodayScreen />}
          {activeTab === "habits" && (
            <HabitsScreen
              onAddHabit={handleAddHabit}
              onEditHabit={handleEditHabit}
            />
          )}
          {activeTab === "rewards" && <RewardsScreen />}
          {activeTab === "profile" && <ProfileScreen />}
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab("today")}
          >
            <Text
              style={
                activeTab === "today" ? styles.tabTextActive : styles.tabText
              }
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab("habits")}
          >
            <Text
              style={
                activeTab === "habits" ? styles.tabTextActive : styles.tabText
              }
            >
              Habits
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab("rewards")}
          >
            <Text
              style={
                activeTab === "rewards" ? styles.tabTextActive : styles.tabText
              }
            >
              Rewards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab("profile")}
          >
            <Text
              style={
                activeTab === "profile" ? styles.tabTextActive : styles.tabText
              }
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showAddEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <AddEditHabitScreen
            habitId={editingHabitId}
            onClose={handleCloseModal}
          />
        </Modal>

        <StatusBar style="auto" />
      </View>
    );
  }

  // Show auth screens
  if (showRegister) {
    return <RegisterScreen onNavigateToLogin={() => setShowRegister(false)} />;
  }

  return <LoginScreen onNavigateToRegister={() => setShowRegister(true)} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  appContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    color: "#999",
  },
  tabTextActive: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
