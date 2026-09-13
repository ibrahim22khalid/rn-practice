import { Habit } from "../types/habit";

const TODOS_URL = "https://jsonplaceholder.typicode.com/todos";
const NETWORK_DELAY_MS = 1500;

type JsonPlaceholderTodo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export type AddHabitInput = Pick<Habit, "name" | "frequency">;
export type MarkHabitDoneInput = Pick<Habit, "id" | "doneToday">;
export type ToggleHabitDayInput = { id: string; dayIndex: number };

// JSONPlaceholder does not persist writes, so this is the smallest session-only
// source of truth that can survive a mutation followed by an invalidating GET.
let sessionHabits: Habit[] | undefined;
let shouldFailFetch = false;
let shouldFailMutation = false;

// Keeps loading and mutation transitions visible for the training exercise.
function waitForNetworkDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
}

// Adapts JSONPlaceholder's Todo contract without leaking it into the Habit UI.
function mapTodoToHabit(todo: JsonPlaceholderTodo): Habit {
  return {
    id: todo.id.toString(),
    name: todo.title,
    streak: todo.completed ? 1 : 0,
    doneToday: todo.completed,
    frequency: "daily",
    lastSevenDays: [
      todo.completed,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
  };
}

// Returns copies so callers cannot mutate the in-memory source outside API calls.
function copyHabits(habits: Habit[]): Habit[] {
  return habits.map((habit) => ({
    ...habit,
    lastSevenDays: [...habit.lastSevenDays],
  }));
}

// Waits at least 1.5 seconds and throws a useful error for failed HTTP responses.
async function assertSuccessfulResponse(
  responsePromise: Promise<Response>,
): Promise<Response> {
  const [response] = await Promise.all([responsePromise, waitForNetworkDelay()]);

  if (!response.ok) {
    throw new Error(`Habit request failed with status ${response.status}`);
  }

  return response;
}

// Preserves the original switch used to demonstrate query error and retry states.
export function setShouldFail(value: boolean): void {
  shouldFailFetch = value;
}

// Lets the optimistic mutation rollback be demonstrated without changing the UI.
export function setShouldMutationFail(value: boolean): void {
  shouldFailMutation = value;
}

// Fetches the first four external todos, then returns the session source of truth.
export async function fetchHabits(): Promise<Habit[]> {
  const response = await assertSuccessfulResponse(fetch(TODOS_URL));

  if (shouldFailFetch) {
    throw new Error("Failed to fetch habits");
  }

  const todos = (await response.json()) as JsonPlaceholderTodo[];
  sessionHabits ??= todos.slice(0, 4).map(mapTodoToHabit);

  return copyHabits(sessionHabits);
}

// Sends the PATCH demonstration request and persists its result for later GETs.
export async function markHabitDone({
  id,
  doneToday,
}: MarkHabitDoneInput): Promise<Habit> {
  const jsonPlaceholderId = id.startsWith("local-") ? "1" : id;
  const responsePromise = fetch(`${TODOS_URL}/${jsonPlaceholderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: doneToday }),
  });

  await assertSuccessfulResponse(responsePromise);
  if (shouldFailMutation) throw new Error("Failed to update habit");
  if (!sessionHabits) throw new Error("Habits must be loaded before updating");

  const habit = sessionHabits.find((item) => item.id === id);
  if (!habit) throw new Error("Habit not found");

  const updatedHabit = { ...habit, doneToday };
  sessionHabits = sessionHabits.map((item) =>
    item.id === id ? updatedHabit : item,
  );

  return { ...updatedHabit, lastSevenDays: [...updatedHabit.lastSevenDays] };
}

// Persists a seven-day checkbox change while retaining the original streak rules.
export async function toggleHabitDay({
  id,
  dayIndex,
}: ToggleHabitDayInput): Promise<Habit> {
  const jsonPlaceholderId = id.startsWith("local-") ? "1" : id;
  const responsePromise = fetch(`${TODOS_URL}/${jsonPlaceholderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dayIndex }),
  });

  await assertSuccessfulResponse(responsePromise);
  if (shouldFailMutation) throw new Error("Failed to update habit");
  if (!sessionHabits) throw new Error("Habits must be loaded before updating");

  const habit = sessionHabits.find((item) => item.id === id);
  if (!habit) throw new Error("Habit not found");

  const lastSevenDays = [...habit.lastSevenDays];
  const wasDone = lastSevenDays[dayIndex];
  lastSevenDays[dayIndex] = !wasDone;
  const activeDaysCount = lastSevenDays.filter(Boolean).length;
  const rawStreak = wasDone ? habit.streak - 1 : habit.streak + 1;
  const updatedHabit = {
    ...habit,
    lastSevenDays,
    streak: Math.max(rawStreak, activeDaysCount, 0),
  };

  sessionHabits = sessionHabits.map((item) =>
    item.id === id ? updatedHabit : item,
  );

  return copyHabits([updatedHabit])[0];
}

// Sends a POST and adds a locally identified habit to the session source of truth.
export async function addHabit(input: AddHabitInput): Promise<Habit> {
  const responsePromise = fetch(TODOS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.name.trim(),
      completed: false,
      userId: 1,
    }),
  });

  await assertSuccessfulResponse(responsePromise);
  if (shouldFailMutation) throw new Error("Failed to add habit");
  if (!sessionHabits) throw new Error("Habits must be loaded before adding");

  const newHabit: Habit = {
    id: `local-${Date.now()}`,
    name: input.name.trim(),
    frequency: input.frequency,
    streak: 0,
    doneToday: false,
    lastSevenDays: [false, false, false, false, false, false, false],
  };

  sessionHabits = [...sessionHabits, newHabit];
  return copyHabits([newHabit])[0];
}
