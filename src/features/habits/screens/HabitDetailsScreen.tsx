import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Radius, Spacing } from "../../../shared/values/spacing";
import {
  failNextMutation,
  FakeApiError,
  loseNextMutationResponse,
  setHabitDayDone,
} from "../api/habitsApi";
import type {
  SetHabitDayDoneInput,
  SetHabitDoneInput,
} from "../api/habitsApi";
import {
  createSetHabitDoneMutationOptions,
  createMutationSubmissionGuard,
  getAffectedHabitListSnapshots,
} from "../api/habitMutations";
import { habitDetailQueryOptions, habitKeys } from "../api/habitQueries";
import type { Habit } from "../types/habit";
import HabitMutationCacheInspector from "../components/HabitMutationCacheInspector";
import Card from "../../../shared/components/Card";
import Badge from "../../../shared/components/Badge";
import AppButton from "../../../shared/components/AppButton";

type DayMutationContext = Readonly<{
  previousDetail: Habit | undefined;
  listSnapshots: ReturnType<typeof getAffectedHabitListSnapshots>;
}>;

// Applies a day completion change immutably and keeps the streak non-negative.
function updateHabitDay(
  habit: Habit,
  { dayIndex, done }: SetHabitDayDoneInput,
): Habit {
  const lastSevenDays = [...habit.lastSevenDays];
  const wasDone = lastSevenDays[dayIndex];
  if (wasDone === done) return habit;

  lastSevenDays[dayIndex] = done;
  const activeDaysCount = lastSevenDays.filter(Boolean).length;
  const rawStreak = done ? habit.streak + 1 : habit.streak - 1;

  return {
    ...habit,
    lastSevenDays,
    streak: Math.max(rawStreak, activeDaysCount, 0),
  };
}

// Loads and mutates the route-selected habit through its exact detail cache.
export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const submissionGuard = useRef(createMutationSubmissionGuard()).current;
  const [isForcedFailureArmed, setIsForcedFailureArmed] = useState(false);
  const [isLostResponseArmed, setIsLostResponseArmed] = useState(false);
  const {
    data: habit,
    isPending,
    isError,
    isFetching: isDetailFetching,
    refetch,
  } = useQuery(habitDetailQueryOptions(id));

  const markDoneMutation = useMutation(
    createSetHabitDoneMutationOptions(queryClient),
  );

  const dayMutation = useMutation<
    Habit,
    Error,
    SetHabitDayDoneInput,
    DayMutationContext
  >({
    mutationFn: setHabitDayDone,
    retry: false,
    // Snapshots affected caches and applies the selected day immediately.
    onMutate: async (variables) => {
      const detailKey = habitKeys.detail(variables.habitId);
      await queryClient.cancelQueries({ queryKey: habitKeys.lists() });
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });

      const listSnapshots = getAffectedHabitListSnapshots(
        queryClient,
        variables.habitId,
      );
      const previousDetail = queryClient.getQueryData<Habit>(detailKey);

      for (const snapshot of listSnapshots) {
        queryClient.setQueryData<Habit[]>(snapshot.queryKey, (current) =>
          current?.map((item) =>
            item.id === variables.habitId
              ? updateHabitDay(item, variables)
              : item,
          ),
        );
      }
      queryClient.setQueryData<Habit>(detailKey, (current) =>
        current ? updateHabitDay(current, variables) : current,
      );

      return { listSnapshots, previousDetail };
    },
    // Restores the captured list and detail values when the mutation fails.
    onError: (_error, variables, context) => {
      if (!context) return;
      for (const snapshot of context.listSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.previousData);
      }
      queryClient.setQueryData(
        habitKeys.detail(variables.habitId),
        context.previousDetail,
      );
    },
    // Stores the authoritative detail and refreshes all habit list variants.
    onSuccess: async (serverHabit, variables) => {
      queryClient.setQueryData(
        habitKeys.detail(variables.habitId),
        serverHabit,
      );
      await queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
    },
  });

  const isHabitMutationPending =
    markDoneMutation.isPending || dayMutation.isPending;
  const isMutationFailureDemoArmed =
    isForcedFailureArmed || isLostResponseArmed;
  const areDayActionsDisabled =
    isHabitMutationPending || isMutationFailureDemoArmed;
  const didLoseMutationResponse =
    markDoneMutation.error instanceof FakeApiError &&
    markDoneMutation.error.code === "MUTATION_RESPONSE_LOST";
  const nextMutationBehavior = isForcedFailureArmed
    ? "fail before the server write"
    : isLostResponseArmed
      ? "save successfully, then lose the response"
      : "normal";

  // Submits the opposite explicit completion value while blocking duplicate taps.
  const handleToggle = (): void => {
    if (!habit || isHabitMutationPending || !submissionGuard.tryStart()) return;

    const variables: SetHabitDoneInput = {
      habitId: habit.id,
      done: !habit.doneToday,
    };
    setIsForcedFailureArmed(false);
    setIsLostResponseArmed(false);
    markDoneMutation.mutate(variables, { onSettled: submissionGuard.finish });
  };

  // Replays the exact variables from the last completion mutation.
  const handleRetry = (): void => {
    const originalVariables = markDoneMutation.variables;
    if (
      !originalVariables ||
      isHabitMutationPending ||
      !submissionGuard.tryStart()
    ) {
      return;
    }
    markDoneMutation.mutate(originalVariables, {
      onSettled: submissionGuard.finish,
    });
  };

  // Optimistically toggles one day in the selected habit's seven-day history.
  const handleDayToggle = (dayIndex: number): void => {
    if (!habit || areDayActionsDisabled) return;
    dayMutation.mutate({
      habitId: habit.id,
      dayIndex,
      done: !habit.lastSevenDays[dayIndex],
    });
  };

  // Configures the fake API so the next completion mutation demonstrates rollback.
  const armForcedFailure = (): void => {
    if (isHabitMutationPending || isMutationFailureDemoArmed) return;
    failNextMutation();
    setIsForcedFailureArmed(true);
  };

  // Arms an uncertain outcome where the server saves before its response is lost.
  const armLostMutationResponse = (): void => {
    if (isHabitMutationPending || isMutationFailureDemoArmed) return;
    loseNextMutationResponse();
    setIsLostResponseArmed(true);
  };

  // Refetches the authoritative detail after an uncertain mutation outcome.
  const handleDetailReconciliation = (): void => {
    if (isHabitMutationPending || isDetailFetching) return;
    void refetch();
  };

  const pendingButtonText = markDoneMutation.variables?.done
    ? "Marking as done..."
    : "Marking as not done...";

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
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
                      disabled={areDayActionsDisabled}
                      style={[
                        styles.dayBox,
                        {
                          backgroundColor: done
                            ? colors.success
                            : colors.surfaceElevated,
                          borderColor: done ? colors.success : colors.border,
                          opacity: areDayActionsDisabled ? 0.6 : 1,
                        },
                      ]}
                      accessible
                      focusable
                      accessibilityRole="checkbox"
                      accessibilityState={{
                        checked: done,
                        disabled: areDayActionsDisabled,
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
              text={
                markDoneMutation.isPending
                  ? pendingButtonText
                  : habit.doneToday
                    ? "Mark as not done"
                    : "Mark as done"
              }
              variant={habit.doneToday ? "secondary" : "primary"}
              onPress={handleToggle}
              isLoading={markDoneMutation.isPending}
              isEnabled={!dayMutation.isPending}
            />

            {markDoneMutation.isError && (
              <View style={styles.mutationMessage}>
                <Text style={[textStyles.body, { color: colors.error }]}>
                  {didLoseMutationResponse
                    ? "The server response was lost. Your local cache was rolled back, so refetch to learn the server's final state."
                    : "We couldn't update this habit. Your previous state was restored."}
                </Text>
                {__DEV__ && didLoseMutationResponse && (
                  <AppButton
                    text="Refetch detail from fake server"
                    variant="secondary"
                    onPress={handleDetailReconciliation}
                    isLoading={isDetailFetching}
                    isEnabled={!isHabitMutationPending}
                  />
                )}
                <AppButton
                  text="Retry intended change"
                  variant="secondary"
                  onPress={handleRetry}
                  isLoading={markDoneMutation.isPending}
                />
              </View>
            )}

            {markDoneMutation.isSuccess && (
              <Text style={[textStyles.caption, { color: colors.success }]}>
                Habit updated and reconciled with the server.
              </Text>
            )}

            {dayMutation.isError && (
              <Text style={[textStyles.caption, { color: colors.error }]}>
                We couldn&apos;t update that day. Its previous state was restored.
              </Text>
            )}

            {__DEV__ && (
              <View style={[styles.demoPanel, { borderColor: colors.border }]}>
                <Text style={textStyles.overline}>Mutation failure lab</Text>
                <Text style={textStyles.caption}>
                  Next completion mutation: {nextMutationBehavior}
                </Text>
                <Text style={textStyles.caption}>
                  Last intended command: {markDoneMutation.variables
                    ? JSON.stringify(markDoneMutation.variables)
                    : "none"}
                </Text>
                <AppButton
                  text={isForcedFailureArmed ? "Failure armed" : "Fail next mutation"}
                  variant="secondary"
                  onPress={armForcedFailure}
                  isEnabled={
                    !isHabitMutationPending && !isMutationFailureDemoArmed
                  }
                />
                <AppButton
                  text={
                    isLostResponseArmed
                      ? "Lost response armed"
                      : "Lose next mutation response"
                  }
                  variant="secondary"
                  onPress={armLostMutationResponse}
                  isEnabled={
                    !isHabitMutationPending && !isMutationFailureDemoArmed
                  }
                />
                {markDoneMutation.isSuccess && (
                  <AppButton
                    text="Repeat exact final-state command"
                    variant="secondary"
                    onPress={handleRetry}
                    isEnabled={!isHabitMutationPending}
                  />
                )}
              </View>
            )}

            <HabitMutationCacheInspector habitId={habit.id} />

            <AppButton
              text="Go Back"
              variant="secondary"
              onPress={() => router.back()}
              isEnabled={!isHabitMutationPending}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
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
  mutationMessage: { gap: Spacing.sm },
  demoPanel: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
});
