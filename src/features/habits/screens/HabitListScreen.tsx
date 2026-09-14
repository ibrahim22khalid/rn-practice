import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  keepPreviousData,
  focusManager,
  onlineManager,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useTheme } from "../../../shared/theme/ThemeContext";
import { getTextStyles } from "../../../shared/values/textStyles";
import { Radius, Spacing } from "../../../shared/values/spacing";
import {
  failNextQuery,
  resetFakeHabitsServer,
  SEARCH_RACE_SCENARIO,
  setDevelopmentCancellationEnabled,
} from "../api/habitsApi";
import {
  createHabitListParams,
  HABIT_QUERY_STALE_TIME_MS,
  habitKeys,
  habitListQueryOptions,
} from "../api/habitQueries";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Habit } from "../types/habit";
import HabitCard from "../components/HabitCard";
import HabitQueryStatusPanel from "../components/HabitQueryStatusPanel";
import HabitFilter, {
  FilterOption,
} from "../components/HabitFilter";
import AppButton from "../../../shared/components/AppButton";

// Short enough to feel responsive, while avoiding a request for every keystroke.
const SEARCH_DEBOUNCE_MS = 350;

function subscribeToOnlineManager(onStoreChange: () => void): () => void {
  return onlineManager.subscribe(onStoreChange);
}

function getOnlineManagerSnapshot(): boolean {
  return onlineManager.isOnline();
}

function subscribeToFocusManager(onStoreChange: () => void): () => void {
  return focusManager.subscribe(onStoreChange);
}

function getFocusManagerSnapshot(): boolean {
  return focusManager.isFocused();
}

// Displays the shared habits query with local-only filtering and derived counts.
export default function HabitListScreen() {
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancellationEnabled, setIsCancellationEnabled] = useState(true);
  const debouncedSearchTerm = useDebouncedValue(
    searchTerm,
    SEARCH_DEBOUNCE_MS,
  );
  const listParams = useMemo(
    () => createHabitListParams(debouncedSearchTerm),
    [debouncedSearchTerm],
  );
  const normalizedSearchTerm = listParams.searchTerm;
  const {
    data,
    isPending,
    isError,
    isPlaceholderData,
    status,
    fetchStatus,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    ...habitListQueryOptions(listParams),
    // TanStack Query v5 keeps usable results visible while the new key loads.
    placeholderData: onlineManager.isOnline() ? keepPreviousData : undefined,
  });
  const habits = data ?? [];
  const [filter, setFilter] = useState<FilterOption>("all");
  const isOnline = useSyncExternalStore(
    subscribeToOnlineManager,
    getOnlineManagerSnapshot,
    () => true,
  );
  const isFocused = useSyncExternalStore(
    subscribeToFocusManager,
    getFocusManagerSnapshot,
    () => true,
  );
  const isDebouncing = searchTerm !== debouncedSearchTerm;
  const isPaused = fetchStatus === "paused";
  const isPausedWithoutData = isPaused && data === undefined;
  const isPausedWithData = isPaused && data !== undefined;
  const isInitialLoading =
    isPending && data === undefined && fetchStatus === "fetching";
  const isBackgroundFetching =
    fetchStatus === "fetching" && data !== undefined;

  const filteredHabits = useMemo(() => {
    if (filter === "done") return habits.filter((habit) => habit.doneToday);
    if (filter === "not_done") {
      return habits.filter((habit) => !habit.doneToday);
    }
    return habits;
  }, [habits, filter]);

  const doneCount = useMemo(
    () => habits.filter((habit) => habit.doneToday).length,
    [habits],
  );

  useEffect(
    () => () => setDevelopmentCancellationEnabled(true),
    [],
  );

  const toggleCancellation = useCallback((): void => {
    const nextValue = !isCancellationEnabled;
    setDevelopmentCancellationEnabled(nextValue);
    setIsCancellationEnabled(nextValue);
  }, [isCancellationEnabled]);

  const resetMutationDemo = useCallback(async (): Promise<void> => {
    resetFakeHabitsServer();
    setIsCancellationEnabled(true);
    await queryClient.resetQueries({ queryKey: habitKeys.all });
  }, [queryClient]);

  const logCacheEvidence = useCallback((): void => {
    if (!__DEV__) return;

    const slowParams = createHabitListParams(SEARCH_RACE_SCENARIO.slow.term);
    const fastParams = createHabitListParams(SEARCH_RACE_SCENARIO.fast.term);
    const slowKey = habitKeys.list(slowParams);
    const fastKey = habitKeys.list(fastParams);
    const slowData = queryClient.getQueryData<Habit[]>(slowKey);
    const fastData = queryClient.getQueryData<Habit[]>(fastKey);

    console.debug("Habit query cache evidence", {
      currentTerm: listParams.searchTerm,
      currentKey: habitKeys.list(listParams),
      visibleResultCount: habits.length,
      showingPlaceholderData: isPlaceholderData,
      slow: { key: slowKey, cachedResultCount: slowData?.length ?? 0 },
      fast: { key: fastKey, cachedResultCount: fastData?.length ?? 0 },
    });
  }, [habits.length, isPlaceholderData, listParams, queryClient]);

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => (
      <HabitCard
        habit={item}
        onPress={() => router.push(`/(tabs)/habits/${item.id}`)}
      />
    ),
    []
  );

  if (isPausedWithoutData) {
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
          <Text style={textStyles.heading2}>Waiting for a network connection...</Text>
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            This query will start automatically when the device reconnects.
          </Text>
          <HabitQueryStatusPanel
            status={status}
            fetchStatus={fetchStatus}
            searchTerm={normalizedSearchTerm}
            isOnline={isOnline}
            isFocused={isFocused}
            dataUpdatedAt={dataUpdatedAt}
          />
        </View>
      </View>
    );
  }

  if (isInitialLoading) {
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
          <HabitQueryStatusPanel
            status={status}
            fetchStatus={fetchStatus}
            searchTerm={normalizedSearchTerm}
            isOnline={isOnline}
            isFocused={isFocused}
            dataUpdatedAt={dataUpdatedAt}
          />
        </View>
      </View>
    );
  }

  if (isError && data === undefined) {
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
          <HabitQueryStatusPanel
            status={status}
            fetchStatus={fetchStatus}
            searchTerm={normalizedSearchTerm}
            isOnline={isOnline}
            isFocused={isFocused}
            dataUpdatedAt={dataUpdatedAt}
          />
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
            <View style={styles.searchRow}>
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder='Search habits (try "heart", then "healing")'
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                accessibilityLabel="Search habits"
                style={[
                  styles.searchInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceElevated,
                    borderColor: isError ? colors.error : colors.border,
                  },
                ]}
              />
              {isBackgroundFetching && (
                <ActivityIndicator
                  accessibilityLabel="Updating habit results"
                  color={colors.primary}
                />
              )}
            </View>
            {isDebouncing && (
              <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                Waiting to search...
              </Text>
            )}
            {isBackgroundFetching && (
              <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                Updating results...
                {isPlaceholderData ? " Showing previous results." : ""}
              </Text>
            )}
            {isPausedWithData && (
              <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                Offline - the update will continue when the connection returns.
              </Text>
            )}
            {isError && (
              <View style={styles.searchErrorRow}>
                <Text style={[textStyles.caption, { color: colors.error }]}>
                  Could not update results
                </Text>
                <AppButton
                  text="Retry"
                  variant="secondary"
                  isExpanded={false}
                  onPress={() => refetch()}
                />
              </View>
            )}
            <HabitFilter selected={filter} onChange={setFilter} />
            <Text style={[textStyles.caption, styles.count]}>
              {doneCount} of {habits.length} done today
            </Text>
            <HabitQueryStatusPanel
              status={status}
              fetchStatus={fetchStatus}
              searchTerm={normalizedSearchTerm}
              isOnline={isOnline}
              isFocused={isFocused}
              dataUpdatedAt={dataUpdatedAt}
            />
            {__DEV__ && (
              <View style={[styles.demoPanel, { borderColor: colors.border }]}>
                <Text style={textStyles.caption}>
                  Demo: "heart" {SEARCH_RACE_SCENARIO.slow.delayMs}ms then
                  "healing" {SEARCH_RACE_SCENARIO.fast.delayMs}ms
                </Text>
                <Text style={textStyles.caption}>
                  Focus stale time: {HABIT_QUERY_STALE_TIME_MS}ms
                </Text>
                <AppButton
                  text={`Cancellation: ${isCancellationEnabled ? "on" : "off"}`}
                  variant="secondary"
                  onPress={toggleCancellation}
                />
                <AppButton
                  text="Fail next query"
                  variant="secondary"
                  onPress={failNextQuery}
                />
                <AppButton
                  text="Log search cache evidence"
                  variant="secondary"
                  onPress={logCacheEvidence}
                />
                <AppButton
                  text="Reset fake server for mutation demo"
                  variant="secondary"
                  onPress={resetMutationDemo}
                />
              </View>
            )}
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
                ? normalizedSearchTerm
                  ? `No habits match "${normalizedSearchTerm}"`
                  : "No habits yet"
                : "No habits match this filter"}
            </Text>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  searchErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  demoPanel: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
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
