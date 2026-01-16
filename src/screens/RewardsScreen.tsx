import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Screen } from "../components/Screen";
import { usePlayerStore } from "../store/player/playerStore";
import { getNextBadgeHint } from "../services/gamification/achievementService";
import { useHabitsStore } from "../store/habits/habitsStore";

export const RewardsScreen: React.FC = () => {
  const { badges, perfectDayDates } = usePlayerStore();
  const { habits, completions } = useHabitsStore();

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked);

  const nextBadgeHint = getNextBadgeHint({
    habits,
    completions,
    currentBadges: badges,
    perfectDayDates,
  });

  return (
    <Screen scrollable={true}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          {unlockedBadges.length} / {badges.length} unlocked
        </Text>
      </View>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Unlocked</Text>
          <View style={styles.badgeGrid}>
            {unlockedBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
                {badge.unlockedAt && (
                  <Text style={styles.badgeDate}>
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Locked</Text>
          {nextBadgeHint && (
            <View style={styles.hintCard}>
              <Text style={styles.hintTitle}>Next Badge</Text>
              <Text style={styles.hintText}>{nextBadgeHint}</Text>
            </View>
          )}
          <View style={styles.badgeGrid}>
            {lockedBadges.map((badge) => (
              <View
                key={badge.id}
                style={[styles.badgeCard, styles.badgeCardLocked]}
              >
                <Text style={styles.badgeIconLocked}>{badge.icon}</Text>
                <Text style={styles.badgeNameLocked}>{badge.name}</Text>
                <Text style={styles.badgeDescriptionLocked}>
                  {badge.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
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
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "48%",
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  badgeCardLocked: {
    backgroundColor: "#F5F5F5",
    borderColor: "#CCC",
    opacity: 0.7,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeIconLocked: {
    fontSize: 48,
    marginBottom: 8,
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeNameLocked: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  badgeDescriptionLocked: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  badgeDate: {
    fontSize: 10,
    color: "#007AFF",
    marginTop: 4,
  },
  hintCard: {
    backgroundColor: "#FFF9E6",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: "#666",
  },
});
