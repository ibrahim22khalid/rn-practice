import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Spacing, Radius } from "../../../shared/values/spacing";
import {
  fetchHabits,
  markHabitDone,
  toggleHabitDay,
} from "../api/habitsApi";
import { Habit } from "../types/habit";
import Card from "../../../shared/components/Card";
import Badge from "../../../shared/components/Badge";
import AppButton from "../../../shared/components/AppButton";

type MutationContext = { previousHabits: Habit[] | undefined };

// Shows one route-selected habit while reading and mutating the shared query cache.
export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: habits = [], isPending, isError, refetch } = useQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  });
  const habit = habits.find((item) => item.id === id);

  const markDoneMutation = useMutation<
    Habit,
    Error,
    { id: string; doneToday: boolean },
    MutationContext
  >({
    mutationFn: markHabitDone,
    onMutate: async (updatedHabit) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const previousHabits = queryClient.getQueryData<Habit[]>(["habits"]);

      queryClient.setQueryData<Habit[]>(["habits"], (current = []) =>
        current.map((item) =>
          item.id === updatedHabit.id
            ? { ...item, doneToday: updatedHabit.doneToday }
            : item,
        ),
      );

      return { previousHabits };
    },
    onError: (_error, _updatedHabit, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(["habits"], context.previousHabits);
      }
    },
    onSuccess: () => router.back(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["habits"] }),
  });

  const dayMutation = useMutation<
    Habit,
    Error,
    { id: string; dayIndex: number },
    MutationContext
  >({
    mutationFn: toggleHabitDay,
    onMutate: async ({ id: habitId, dayIndex }) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });
      const previousHabits = queryClient.getQueryData<Habit[]>(["habits"]);

      queryClient.setQueryData<Habit[]>(["habits"], (current = []) =>
        current.map((item) => {
          if (item.id !== habitId) return item;

          const lastSevenDays = [...item.lastSevenDays];
          const wasDone = lastSevenDays[dayIndex];
          lastSevenDays[dayIndex] = !wasDone;
          const activeDaysCount = lastSevenDays.filter(Boolean).length;
          const rawStreak = wasDone ? item.streak - 1 : item.streak + 1;

          return {
            ...item,
            lastSevenDays,
            streak: Math.max(rawStreak, activeDaysCount, 0),
          };
        }),
      );

      return { previousHabits };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(["habits"], context.previousHabits);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["habits"] }),
  });

  // Starts the optimistic change; successful mutations navigate back afterward.
  const handleToggle = (): void => {
    if (!habit) return;

    markDoneMutation.mutate({ id: habit.id, doneToday: !habit.doneToday });
  };

  // Sends a day-box change through its mutation and optimistic cache lifecycle.
  const handleDayToggle = (dayIndex: number): void => {
    if (habit) dayMutation.mutate({ id: habit.id, dayIndex });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>
        {habit ? (
          <>
            <Text style={[textStyles.heading1, styles.title]}>{habit.name}</Text>
            <Card style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Streak</Text>
                <Text style={textStyles.body}>{habit.streak} day streak</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Frequency</Text>
                <Badge variant={habit.frequency === "daily" ? "info" : "neutral"}>
                  <Text
                    style={[
                      textStyles.caption,
                      {
                        color:
                          habit.frequency === "daily"
                            ? colors.info
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {habit.frequency}
                  </Text>
                </Badge>
              </View>
              <View style={styles.detailRow}>
                <Text style={textStyles.overline}>Last seven days</Text>
                <View style={styles.sevenRow}>
                  {habit.lastSevenDays.map((done, index) => (
                    <Pressable
                      key={`${habit.id}-${index}`}
                      onPress={() => handleDayToggle(index)}
                      disabled={dayMutation.isPending}
                      style={[
                        styles.dayBox,
                        {
                          backgroundColor: done
                            ? colors.success
                            : colors.surfaceElevated,
                          borderColor: done ? colors.success : colors.border,
                        },
                      ]}
                      accessible
                      focusable
                      accessibilityRole="checkbox"
                      accessibilityState={{
                        checked: done,
                        disabled: dayMutation.isPending,
                      }}
                      accessibilityLabel={`Day ${index + 1}: ${
                        done ? "completed" : "not completed"
                      }`}
                    >
                      <Text
                        style={[
                          textStyles.caption,
                          {
                            color: done
                              ? colors.background
                              : colors.textDisabled,
                          },
                        ]}
                      >
                        {done ? "✓" : " "}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Card>

            <AppButton
              text={habit.doneToday ? "Mark as not done" : "Mark as done"}
              variant={habit.doneToday ? "secondary" : "primary"}
              onPress={handleToggle}
              isLoading={markDoneMutation.isPending}
            />

            <AppButton
              text="Go Back"
              variant="secondary"
              onPress={() => router.back()}
            />
          </>
        ) : (
          <View style={[styles.centered, { gap: Spacing.md }]}>
            <Text style={[textStyles.heading2, { color: colors.textSecondary }]}>
              {isError ? "Something went wrong" : "Habit not found"}
            </Text>
            {isPending ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <AppButton text="Retry" onPress={() => refetch()} />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.lg,
  },
  title: { marginBottom: Spacing.xs },
  detailCard: { gap: Spacing.lg },
  detailRow: { gap: Spacing.xs },
  sevenRow: { flexDirection: "row", gap: Spacing.xs },
  dayBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
