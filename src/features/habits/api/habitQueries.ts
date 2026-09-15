import { queryOptions } from "@tanstack/react-query";

import {
  fetchHabit,
  isHabitRequestCancellationEnabled,
  normalizeHabitSearchTerm,
  searchHabits,
} from "./habitsApi";
import type { Habit } from "../types/habit";

export type HabitListParams = Readonly<{
  searchTerm: string;
}>;

// Five seconds makes fresh/stale focus behavior reproducible in training.
export const HABIT_QUERY_STALE_TIME_MS = 5000;

// Centralizes hierarchical cache-key factories for broad or exact cache operations.
export const habitKeys = {
  all: ["habits"] as const,
  lists: () => [...habitKeys.all, "list"] as const,
  list: (params: HabitListParams) =>
    [...habitKeys.lists(), params] as const,
  details: () => [...habitKeys.all, "detail"] as const,
  detail: (habitId: Habit["id"]) => [...habitKeys.details(), habitId] as const,
};

export const ALL_HABITS_PARAMS: HabitListParams = Object.freeze({
  searchTerm: "",
});

// Normalizes raw search input so equivalent searches share the same cache key.
export function createHabitListParams(rawSearchTerm: string): HabitListParams {
  return Object.freeze({
    searchTerm: normalizeHabitSearchTerm(rawSearchTerm),
  });
}

// Builds the reusable TanStack Query configuration for habit list searches.
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

// Builds the reusable TanStack Query configuration for one habit detail request.
export function habitDetailQueryOptions(habitId: Habit["id"]) {
  return queryOptions({
    queryKey: habitKeys.detail(habitId),
    queryFn: (context) => fetchHabit(habitId, context.signal),
    retry: false,
    staleTime: HABIT_QUERY_STALE_TIME_MS,
  });
}
