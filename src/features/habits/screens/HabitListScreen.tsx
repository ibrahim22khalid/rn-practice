import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing } from "../../../shared/values/spacing";
import { useHabits } from "../hooks/UseHabits";
import { Habit } from "../types/habit";
import HabitCard from "../components/HabitCard";
import HabitFilter, {
  FilterOption,
} from "../components/HabitFilter";
import AppButton from "../../../shared/components/AppButton";

export default function HabitListScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const { habits, loading, error, loadHabits, refetch } = useHabits();
  const [filter, setFilter] = useState<FilterOption>("all");

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const filteredHabits = useMemo(() => {
    if (filter === "done") return habits.filter((h) => h.doneToday);
    if (filter === "not_done") return habits.filter((h) => !h.doneToday);
    return habits;
  }, [habits, filter]);

  const doneCount = useMemo(
    () => habits.filter((h) => h.doneToday).length,
    [habits]
  );

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => (
      <HabitCard
        habit={item}
        onPress={() => router.push(`/(tabs)/habits/${item.id}`)}
      />
    ),
    []
  );

  if (loading) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={colors.backgroundGradient}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.centered,
            { paddingTop: insets.top + Spacing.lg },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={colors.backgroundGradient}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.centered,
            styles.padded,
            { paddingTop: insets.top + Spacing.lg, gap: Spacing.md },
          ]}
        >
          <Text style={textStyles.heading2}>Something went wrong</Text>
          <View style={styles.retryButton}>
            <AppButton
              text="Retry"
              isExpanded={false}
              onPress={() => refetch()}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[textStyles.heading1, styles.title]}>Habits</Text>
            <HabitFilter selected={filter} onChange={setFilter} />
            <Text style={[textStyles.caption, styles.count]}>
              {doneCount} of {habits.length} done today
            </Text>
            <AppButton
              text="Add Habit"
              variant="secondary"
              onPress={() => router.push("/(tabs)/habits/add")}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.empty, { gap: Spacing.md }]}>
            <Text style={[textStyles.body, { color: colors.textSecondary }]}>
              {habits.length === 0
                ? "No habits yet"
                : "No habits match this filter"}
            </Text>
            <View style={styles.retryButton}>
              <AppButton
                text="Retry"
                variant="secondary"
                isExpanded={false}
                onPress={() => refetch()}
              />
            </View>
          </View>
        }
        ListFooterComponent={
          <AppButton
            text="hard-coded id not found to test error handling"
            variant="secondary"
            onPress={() => router.push("/(tabs)/habits/50")}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  padded: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  count: {
    marginTop: Spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    alignSelf: "center",
  },
});
