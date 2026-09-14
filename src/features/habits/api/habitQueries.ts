import { queryOptions } from "@tanstack/react-query";

import {
  isHabitRequestCancellationEnabled,
  normalizeHabitSearchTerm,
  searchHabits,
} from "./habitsApi";

export type HabitListParams = Readonly<{
  searchTerm: string;
}>;

// Five seconds makes fresh/stale focus behavior reproducible in training.
export const HABIT_QUERY_STALE_TIME_MS = 5000;

export const habitKeys = {
  all: ["habits"] as const,
  lists: () => [...habitKeys.all, "list"] as const,
  list: (params: HabitListParams) =>
    [...habitKeys.lists(), params] as const,
  details: () => [...habitKeys.all, "detail"] as const,
  detail: (habitId: string) => [...habitKeys.details(), habitId] as const,
};

export const ALL_HABITS_PARAMS: HabitListParams = Object.freeze({
  searchTerm: "",
});

export function createHabitListParams(rawSearchTerm: string): HabitListParams {
  return Object.freeze({
    searchTerm: normalizeHabitSearchTerm(rawSearchTerm),
  });
}

export function habitListQueryOptions(params: HabitListParams) {
  return queryOptions({
    queryKey: habitKeys.list(params),
    // The fake search treats an empty term as the complete list.
    queryFn: (context) =>
      searchHabits(
        params.searchTerm,
        isHabitRequestCancellationEnabled() ? context.signal : undefined,
      ),
    // A one-shot training failure must remain visible instead of being retried.
    retry: false,
    staleTime: HABIT_QUERY_STALE_TIME_MS,
  });
}
