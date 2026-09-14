import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { setHabitDone } from "./habitsApi";
import type { SetHabitDoneInput } from "./habitsApi";
import { habitKeys } from "./habitQueries";
import type { Habit } from "../types/habit";

export type HabitListSnapshot = Readonly<{
  queryKey: QueryKey;
  previousData: Habit[];
}>;

export type SetHabitDoneMutationContext = Readonly<{
  listSnapshots: readonly HabitListSnapshot[];
  detailKey: ReturnType<typeof habitKeys.detail>;
  previousDetail: Habit | undefined;
}>;

export type MutationSubmissionGuard = Readonly<{
  tryStart: () => boolean;
  finish: () => void;
}>;

export function createMutationSubmissionGuard(): MutationSubmissionGuard {
  let isSubmissionInFlight = false;

  return {
    tryStart: () => {
      if (isSubmissionInFlight) return false;
      isSubmissionInFlight = true;
      return true;
    },
    finish: () => {
      isSubmissionInFlight = false;
    },
  };
}

export function updateHabitDoneInList(
  habits: Habit[] | undefined,
  { habitId, done }: SetHabitDoneInput,
): Habit[] | undefined {
  if (!habits) return undefined;

  return habits.map((habit) =>
    habit.id === habitId ? { ...habit, doneToday: done } : habit,
  );
}

export function updateHabitDoneInDetail(
  habit: Habit | undefined,
  { habitId, done }: SetHabitDoneInput,
): Habit | undefined {
  if (!habit || habit.id !== habitId) return habit;
  return { ...habit, doneToday: done };
}

export function getAffectedHabitListSnapshots(
  queryClient: QueryClient,
  habitId: Habit["id"],
): HabitListSnapshot[] {
  return queryClient
    .getQueriesData<Habit[]>({ queryKey: habitKeys.lists() })
    .flatMap(([queryKey, previousData]) =>
      previousData?.some((habit) => habit.id === habitId)
        ? [{ queryKey, previousData }]
        : [],
    );
}

export function createSetHabitDoneMutationOptions(queryClient: QueryClient) {
  return {
    mutationFn: setHabitDone,
    retry: false as const,
    onMutate: async (
      variables: SetHabitDoneInput,
    ): Promise<SetHabitDoneMutationContext> => {
      const detailKey = habitKeys.detail(variables.habitId);

      // Cancel first so an older response cannot overwrite the optimistic state.
      await queryClient.cancelQueries({ queryKey: habitKeys.lists() });
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });

      const listSnapshots = getAffectedHabitListSnapshots(
        queryClient,
        variables.habitId,
      );
      const previousDetail = queryClient.getQueryData<Habit>(detailKey);

      for (const snapshot of listSnapshots) {
        queryClient.setQueryData<Habit[]>(snapshot.queryKey, (current) =>
          updateHabitDoneInList(current, variables),
        );
      }

      queryClient.setQueryData<Habit>(detailKey, (current) => {
        if (!current && __DEV__) {
          console.error(
            "[habit mutation] Expected the target detail query to be cached",
            { detailKey },
          );
        }
        return updateHabitDoneInDetail(current, variables);
      });

      if (__DEV__) {
        console.debug("[habit mutation] optimistic update", {
          variables,
          listKeys: listSnapshots.map(({ queryKey }) => queryKey),
          detailKey,
        });
      }

      return { listSnapshots, detailKey, previousDetail };
    },
    onError: (
      _error: Error,
      variables: SetHabitDoneInput,
      context: SetHabitDoneMutationContext | undefined,
    ): void => {
      if (!context) return;

      for (const snapshot of context.listSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.previousData);
      }
      queryClient.setQueryData<Habit>(
        context.detailKey,
        context.previousDetail,
      );

      if (__DEV__) {
        console.debug("[habit mutation] rolled back", {
          variables,
          listKeys: context.listSnapshots.map(({ queryKey }) => queryKey),
          detailKey: context.detailKey,
        });
      }
    },
    onSuccess: async (
      serverHabit: Habit,
      variables: SetHabitDoneInput,
    ): Promise<void> => {
      queryClient.setQueryData(habitKeys.detail(variables.habitId), serverHabit);

      if (__DEV__) {
        console.debug("[habit mutation] reconciled from server", {
          variables,
          serverHabit,
          invalidatedPrefix: habitKeys.lists(),
        });
      }

      // Awaiting keeps the mutation pending until active lists are reconciled.
      await queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
    },
  };
}
