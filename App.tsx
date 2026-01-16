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
import { TodayScreen } from "./src/screens/TodayScreen.tsx";
import { HabitsScreen } from "./src/screens/HabitsScreen.tsx";
import { ProfileScreen } from "./src/screens/ProfileScreen.tsx";
import { AddEditHabitScreen } from "./src/screens/AddEditHabitScreen.tsx";
import { useAuthStore } from "./src/store/auth/authStore";
import { useHabitsStore } from "./src/store/habits/habitsStore";
import { usePlayerStore } from "./src/store/player/playerStore";

export default function App() {
  const { initialize, isLoading, user } = useAuthStore();
  const { loadData } = useHabitsStore();
  const { loadPlayer } = usePlayerStore();
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
