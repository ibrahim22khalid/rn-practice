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

// Creates a small lock that prevents duplicate mutation submissions while one is active.
export function createMutationSubmissionGuard(): MutationSubmissionGuard {
  let isSubmissionInFlight = false;

  return {
    // Acquires the submission lock unless another completion request is active.
    tryStart: () => {
      if (isSubmissionInFlight) return false;
      isSubmissionInFlight = true;
      return true;
    },
    // Releases the submission lock after the active request settles.
    finish: () => {
      isSubmissionInFlight = false;
    },
  };
}

// Applies a completion value immutably to the matching habit in cached list data.
export function updateHabitDoneInList(
  habits: Habit[] | undefined,
  { habitId, done }: SetHabitDoneInput,
): Habit[] | undefined {
  if (!habits) return undefined;

  return habits.map((habit) =>
    habit.id === habitId ? { ...habit, doneToday: done } : habit,
  );
}

// Applies a completion value only when the cached detail belongs to the target habit.
export function updateHabitDoneInDetail(
  habit: Habit | undefined,
  { habitId, done }: SetHabitDoneInput,
): Habit | undefined {
  if (!habit || habit.id !== habitId) return habit;
  return { ...habit, doneToday: done };
}

// Captures every cached habit list containing the target so it can be updated or restored.
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

// Defines the optimistic update, rollback, and server reconciliation lifecycle.
export function createSetHabitDoneMutationOptions(queryClient: QueryClient) {
  return {
    mutationFn: setHabitDone,
    retry: false as const,
    // Cancels competing reads, snapshots the cache, and applies the intended value immediately.
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
    // Restores every captured cache entry if the server mutation fails.
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
    // Replaces detail data with the server result and refreshes all list variants.
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
