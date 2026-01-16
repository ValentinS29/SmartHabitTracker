import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/auth/authStore";

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

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

  return (
    <Screen scrollable={true}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
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
    marginTop: 40,
  },
});
