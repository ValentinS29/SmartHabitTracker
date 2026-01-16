import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/auth/authStore";
import { usePlayerStore } from "../store/player/playerStore";
import { getRequiredXP } from "../services/gamification/levelService";

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { level, xpTotal, xpIntoLevel, xpToNextLevel, levelProgress } =
    usePlayerStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const requiredXP = getRequiredXP(level);
  // Convert 0-1 to 0-100 for flex values
  const progressPercent = Math.min(100, Math.max(0, levelProgress * 100));

  return (
    <Screen scrollable={true}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.levelSection}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelValue}>{level}</Text>
          <Text style={styles.xpText}>
            {xpIntoLevel} / {requiredXP} XP
          </Text>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBarFill, { flex: progressPercent }]}
              />
              <View style={{ flex: 100 - progressPercent }} />
            </View>
          </View>

          <Text style={styles.xpToNextLevel}>
            {xpToNextLevel} XP to next level
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Total XP</Text>
          <Text style={styles.sectionValue}>{xpTotal}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Email</Text>
          <Text style={styles.sectionValue}>{user?.email || "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <Text style={styles.sectionValue}>Free Plan</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Logout" onPress={handleLogout} variant="secondary" />
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
  content: {
    padding: 20,
  },
  levelSection: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  levelValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  xpText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  progressBarContainer: {
    width: "100%",
    marginBottom: 8,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  xpToNextLevel: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionValue: {
    fontSize: 18,
    color: "#333",
  },
  actions: {
    marginTop: 20,
  },
});
