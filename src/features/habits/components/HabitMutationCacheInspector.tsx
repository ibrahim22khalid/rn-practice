import { StyleSheet, Text, View } from "react-native";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import AppButton from "../../../shared/components/AppButton";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Radius, Spacing } from "../../../shared/values/spacing";
import { getTextStyles } from "../../../shared/values/textStyles";
import { getFakeServerHabit } from "../api/habitsApi";
import { habitKeys } from "../api/habitQueries";
import type { Habit } from "../types/habit";

type HabitMutationCacheInspectorProps = Readonly<{
  habitId: Habit["id"];
}>;

export default function HabitMutationCacheInspector({
  habitId,
}: HabitMutationCacheInspectorProps) {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const textStyles = getTextStyles(colors);
  const listFetchCount = useIsFetching({ queryKey: habitKeys.lists() });

  if (!__DEV__) return null;

  const listEntries = queryClient
    .getQueriesData<Habit[]>({ queryKey: habitKeys.lists() })
    .flatMap(([queryKey, habits]) => {
      const habit = habits?.find((item) => item.id === habitId);
      return habit ? [{ queryKey, done: habit.doneToday }] : [];
    });
  const detailKey = habitKeys.detail(habitId);
  const detailHabit = queryClient.getQueryData<Habit>(detailKey);
  const serverHabit = getFakeServerHabit(habitId);

  const evidence = {
    habitId,
    lists: listEntries,
    detail: { queryKey: detailKey, done: detailHabit?.doneToday },
    serverDone: serverHabit?.doneToday,
    activeListFetches: listFetchCount,
  };

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={textStyles.overline}>PUR-25 mutation cache inspector</Text>
      <Text style={textStyles.caption}>target: {habitId}</Text>
      {listEntries.length === 0 ? (
        <Text style={[textStyles.caption, { color: colors.error }]}>
          No cached list currently contains this habit.
        </Text>
      ) : (
        listEntries.map(({ queryKey, done }) => (
          <Text key={JSON.stringify(queryKey)} style={textStyles.caption}>
            list {JSON.stringify(queryKey)}: done={String(done)}
          </Text>
        ))
      )}
      <Text style={textStyles.caption}>
        detail {JSON.stringify(detailKey)}: done={String(detailHabit?.doneToday)}
      </Text>
      <Text style={textStyles.caption}>
        fake server: done={String(serverHabit?.doneToday)}
      </Text>
      <Text style={textStyles.caption}>
        active list fetches: {listFetchCount}
      </Text>
      <AppButton
        text="Log mutation cache evidence"
        variant="secondary"
        onPress={() => console.debug("PUR-25 cache evidence", evidence)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
});
