import type { Habit } from "../types/habit";

export type AddHabitInput = Pick<Habit, "name" | "frequency">;
export type SetHabitDoneInput = Readonly<{
  habitId: Habit["id"];
  done: boolean;
}>;
export type SetHabitDayDoneInput = Readonly<{
  habitId: Habit["id"];
  dayIndex: number;
  done: boolean;
}>;

export type FakeApiRequestType = "list" | "detail" | "search" | "mutation";
export type FakeApiRequestEvent =
  | "started"
  | "completed"
  | "failed"
  | "aborted";

export type FakeApiRequestLogEntry = Readonly<{
  requestId: number;
  requestType: FakeApiRequestType;
  searchTerm: string | null;
  event: FakeApiRequestEvent;
}>;

export type FakeApiDelayConfig = Readonly<{
  defaultMs: number;
  listMs: number;
  mutationMs: number;
  searchMs: Readonly<Record<string, number>>;
}>;

export type FakeApiErrorCode =
  | "ABORTED"
  | "QUERY_FAILED"
  | "MUTATION_FAILED"
  | "MUTATION_RESPONSE_LOST"
  | "HABIT_NOT_FOUND"
  | "INVALID_DAY_INDEX";

export class FakeApiError extends Error {
  readonly code: FakeApiErrorCode;

  // Preserves a machine-readable error code while exposing standard Error behavior.
  constructor(code: FakeApiErrorCode, message: string) {
    super(message);
    this.name =
      code === "ABORTED"
        ? "AbortError"
        : code === "MUTATION_RESPONSE_LOST"
          ? "NetworkError"
          : "FakeApiError";
    this.code = code;
  }
}

export const SEARCH_RACE_SCENARIO = {
  slow: { term: "heart", delayMs: 2500 },
  fast: { term: "healing", delayMs: 300 },
} as const;

const HABIT_THEMES = [
  "Heart health",
  "Healing journal",
  "Morning hydration",
  "Evening reflection",
  "Mindful breathing",
  "Daily movement",
  "Focused reading",
  "Creative practice",
  "Healthy cooking",
  "Gratitude notes",
  "Sleep routine",
  "Outdoor walking",
  "Digital pause",
  "Strength training",
  "Language learning",
  "Workspace reset",
  "Family connection",
  "Financial review",
  "Posture check",
  "Weekly planning",
] as const;

const HABIT_VARIANTS = [
  "starter",
  "foundation",
  "practice",
  "check-in",
  "session",
  "routine",
  "challenge",
  "reset",
  "progress",
  "review",
] as const;

const INITIAL_DELAY_CONFIG: FakeApiDelayConfig = {
  defaultMs: 600,
  listMs: 600,
  // Long enough to inspect the optimistic cache state during training.
  mutationMs: 1500,
  searchMs: {
    [SEARCH_RACE_SCENARIO.slow.term]: SEARCH_RACE_SCENARIO.slow.delayMs,
    [SEARCH_RACE_SCENARIO.fast.term]: SEARCH_RACE_SCENARIO.fast.delayMs,
  },
};

let serverHabits = generateHabits();
let nextHabitNumber = serverHabits.length + 1;
let shouldFailNextQuery = false;
let shouldFailNextMutation = false;
let shouldLoseNextMutationResponse = false;
let delayConfig = copyDelayConfig(INITIAL_DELAY_CONFIG);
let nextRequestId = 1;
let requestLog: FakeApiRequestLogEntry[] = [];
let isDevelopmentCancellationEnabled = true;

// Generates deterministic seed data for list, search, detail, and mutation demos.
function generateHabits(): Habit[] {
  return HABIT_THEMES.flatMap((theme, themeIndex) =>
    HABIT_VARIANTS.map((variant, variantIndex) => {
      const habitIndex = themeIndex * HABIT_VARIANTS.length + variantIndex;
      const lastSevenDays = Array.from(
        { length: 7 },
        (_, dayIndex) => (habitIndex + dayIndex) % 4 === 0,
      );

      return {
        id: `habit-${String(habitIndex + 1).padStart(3, "0")}`,
        name: `${theme} ${variant}`,
        streak: (habitIndex * 3) % 31,
        doneToday: lastSevenDays[6],
        frequency: habitIndex % 3 === 0 ? "weekly" : "daily",
        lastSevenDays,
      };
    }),
  );
}

// Clones a habit and its nested history array to protect the fake server state.
function copyHabit(habit: Habit): Habit {
  return { ...habit, lastSevenDays: [...habit.lastSevenDays] };
}

// Returns safe copies of a complete habit collection.
function copyHabits(habits: readonly Habit[]): Habit[] {
  return habits.map(copyHabit);
}

// Clones delay settings, including the nested per-search delay map.
function copyDelayConfig(config: FakeApiDelayConfig): FakeApiDelayConfig {
  return { ...config, searchMs: { ...config.searchMs } };
}

// Produces the canonical search value used by both requests and query keys.
export function normalizeHabitSearchTerm(term: string): string {
  return term.trim().toLowerCase();
}

// Rejects invalid artificial delays before they can affect request simulations.
function assertValidDelay(delayMs: number, label: string): void {
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new RangeError(`${label} must be a finite, non-negative number`);
  }
}

// Creates the consistent abort-shaped error used by cancellable fake requests.
function createAbortError(): FakeApiError {
  return new FakeApiError("ABORTED", "Habit request was aborted");
}

// Identifies cancellation errors separately from ordinary query or mutation failures.
function isAbortError(error: unknown): boolean {
  return error instanceof FakeApiError && error.code === "ABORTED";
}

// Waits for the configured latency and rejects early when the request is aborted.
function waitForDelay(delayMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const handleAbort = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", handleAbort);
      reject(createAbortError());
    };

    timer = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

// Formats a request lifecycle entry for readable development logging.
function formatRequestLog(entry: FakeApiRequestLogEntry): string {
  const subject =
    entry.requestType === "search"
      ? `search "${entry.searchTerm ?? ""}"`
      : entry.requestType;
  return `[${entry.requestId}] ${subject} ${entry.event}`;
}

// Records and prints request lifecycle events in development builds.
function logRequest(
  requestId: number,
  requestType: FakeApiRequestType,
  searchTerm: string | null,
  event: FakeApiRequestEvent,
): void {
  if (!__DEV__) return;

  const entry: FakeApiRequestLogEntry = {
    requestId,
    requestType,
    searchTerm,
    event,
  };
  requestLog.push(entry);
  console.debug(formatRequestLog(entry));
}

// Selects the artificial delay for the current request type and search term.
function getDelayMs(
  requestType: FakeApiRequestType,
  searchTerm: string | null,
): number {
  if (requestType === "list" || requestType === "detail") {
    return delayConfig.listMs;
  }
  if (requestType === "mutation") return delayConfig.mutationMs;
  return searchTerm === null
    ? delayConfig.defaultMs
    : (delayConfig.searchMs[searchTerm] ?? delayConfig.defaultMs);
}

// Consumes one armed failure flag and throws the matching simulated API error.
function consumeForcedFailure(requestType: FakeApiRequestType): void {
  if (requestType === "mutation" && shouldFailNextMutation) {
    shouldFailNextMutation = false;
    throw new FakeApiError(
      "MUTATION_FAILED",
      "The next habit mutation was configured to fail",
    );
  }

  if (requestType !== "mutation" && shouldFailNextQuery) {
    shouldFailNextQuery = false;
    throw new FakeApiError(
      "QUERY_FAILED",
      "The next habit query was configured to fail",
    );
  }
}

// Runs a fake request with delay, cancellation, forced failure, and lifecycle logging.
async function runRequest<T>(
  requestType: FakeApiRequestType,
  searchTerm: string | null,
  operation: () => T,
  signal?: AbortSignal,
): Promise<T> {
  const requestId = nextRequestId;
  const requestSignal =
    __DEV__ && !isDevelopmentCancellationEnabled ? undefined : signal;
  nextRequestId += 1;
  logRequest(requestId, requestType, searchTerm, "started");

  try {
    await waitForDelay(getDelayMs(requestType, searchTerm), requestSignal);
    if (requestSignal?.aborted) throw createAbortError();
    consumeForcedFailure(requestType);
    const result = operation();
    logRequest(requestId, requestType, searchTerm, "completed");
    return result;
  } catch (error: unknown) {
    logRequest(
      requestId,
      requestType,
      searchTerm,
      isAbortError(error) ? "aborted" : "failed",
    );
    throw error;
  }
}

// Merges validated delay overrides into the current fake API configuration.
export function configureFakeApiDelays(
  config: Partial<FakeApiDelayConfig>,
): void {
  const defaultMs = config.defaultMs ?? delayConfig.defaultMs;
  const listMs = config.listMs ?? delayConfig.listMs;
  const mutationMs = config.mutationMs ?? delayConfig.mutationMs;
  const configuredSearchMs = config.searchMs ?? delayConfig.searchMs;

  assertValidDelay(defaultMs, "defaultMs");
  assertValidDelay(listMs, "listMs");
  assertValidDelay(mutationMs, "mutationMs");

  const searchMs = Object.fromEntries(
    Object.entries(configuredSearchMs).map(([term, delayMs]) => {
      assertValidDelay(delayMs, `search delay for "${term}"`);
      return [normalizeHabitSearchTerm(term), delayMs];
    }),
  );

  delayConfig = { defaultMs, listMs, mutationMs, searchMs };
}

// Restores the predefined slow-versus-fast search race timing.
export function configureSearchRaceScenario(): void {
  configureFakeApiDelays({
    searchMs: {
      ...delayConfig.searchMs,
      [SEARCH_RACE_SCENARIO.slow.term]: SEARCH_RACE_SCENARIO.slow.delayMs,
      [SEARCH_RACE_SCENARIO.fast.term]: SEARCH_RACE_SCENARIO.fast.delayMs,
    },
  });
}

// Exposes a defensive copy of the current fake latency settings.
export function getFakeApiDelayConfig(): FakeApiDelayConfig {
  return copyDelayConfig(delayConfig);
}

// Arms the next list, detail, or search request to fail once.
export function failNextQuery(): void {
  shouldFailNextQuery = true;
}

// Arms the next mutation request to fail once.
export function failNextMutation(): void {
  shouldLoseNextMutationResponse = false;
  shouldFailNextMutation = true;
}

// Arms a development-only network error after the next completion command is stored.
export function loseNextMutationResponse(): void {
  if (!__DEV__) return;

  shouldFailNextMutation = false;
  shouldLoseNextMutationResponse = true;
}

// Training-only switch used to prove key correctness separately from aborting.
// Production requests always consume the supplied signal.
export function setDevelopmentCancellationEnabled(value: boolean): void {
  if (__DEV__) isDevelopmentCancellationEnabled = value;
}

// Reports whether query requests currently consume AbortSignals.
export function isHabitRequestCancellationEnabled(): boolean {
  return !__DEV__ || isDevelopmentCancellationEnabled;
}

// Compatibility controls retained for the existing training screens and demos.
// Sets the legacy one-shot query failure flag to the requested value.
export function setShouldFail(value: boolean): void {
  shouldFailNextQuery = value;
}

// Retains the legacy control used to configure the next mutation failure.
export function setShouldMutationFail(value: boolean): void {
  shouldFailNextMutation = value;
}

// Returns defensive copies of the accumulated request log entries.
export function getFakeApiRequestLog(): readonly FakeApiRequestLogEntry[] {
  return requestLog.map((entry) => ({ ...entry }));
}

// Removes every recorded fake request event.
export function clearFakeApiRequestLog(): void {
  requestLog = [];
}

// Restores the fake server, counters, delays, flags, and logs to their initial state.
export function resetFakeHabitsServer(): void {
  serverHabits = generateHabits();
  nextHabitNumber = serverHabits.length + 1;
  shouldFailNextQuery = false;
  shouldFailNextMutation = false;
  shouldLoseNextMutationResponse = false;
  delayConfig = copyDelayConfig(INITIAL_DELAY_CONFIG);
  nextRequestId = 1;
  isDevelopmentCancellationEnabled = true;
  clearFakeApiRequestLog();
}

// Query retries can make a one-shot failure appear to recover immediately.
// Part 2 should choose its retry policy when wiring these controls into useQuery.
export async function fetchHabits(signal?: AbortSignal): Promise<Habit[]> {
  return runRequest("list", null, () => copyHabits(serverHabits), signal);
}

// Searches habit names using normalized input through the cancellable request runner.
export async function searchHabits(
  term: string,
  signal?: AbortSignal,
): Promise<Habit[]> {
  const normalizedTerm = normalizeHabitSearchTerm(term);
  return runRequest(
    "search",
    normalizedTerm,
    () =>
      copyHabits(
        serverHabits.filter((habit) =>
          habit.name.toLowerCase().includes(normalizedTerm),
        ),
      ),
    signal,
  );
}

// Fetches one habit by id or throws a typed not-found error.
export async function fetchHabit(
  habitId: Habit["id"],
  signal?: AbortSignal,
): Promise<Habit> {
  return runRequest("detail", null, () => {
    const habit = serverHabits.find((item) => item.id === habitId);
    if (!habit) {
      throw new FakeApiError(
        "HABIT_NOT_FOUND",
        `Habit "${habitId}" was not found`,
      );
    }

    return copyHabit(habit);
  }, signal);
}

// Reads a safe copy directly from fake server memory for development inspection.
export function getFakeServerHabit(habitId: Habit["id"]): Habit | undefined {
  const habit = serverHabits.find((item) => item.id === habitId);
  return habit ? copyHabit(habit) : undefined;
}

// Sets today's completion to an explicit final value and returns the saved habit.
export async function setHabitDone({
  habitId,
  done,
}: SetHabitDoneInput): Promise<Habit> {
  return runRequest("mutation", null, () => {
    const habit = serverHabits.find((item) => item.id === habitId);
    if (!habit) {
      throw new FakeApiError(
        "HABIT_NOT_FOUND",
        `Habit "${habitId}" was not found`,
      );
    }

    const updatedHabit = { ...habit, doneToday: done };
    serverHabits = serverHabits.map((item) =>
      item.id === habitId ? updatedHabit : item,
    );

    // Simulate an uncertain network outcome after the server commits the command.
    if (__DEV__ && shouldLoseNextMutationResponse) {
      shouldLoseNextMutationResponse = false;
      throw new FakeApiError(
        "MUTATION_RESPONSE_LOST",
        "The habit was saved, but the mutation response was lost",
      );
    }

    return copyHabit(updatedHabit);
  });
}

// Updates one of the last seven days and recalculates the displayed streak safely.
export async function setHabitDayDone({
  habitId,
  dayIndex,
  done,
}: SetHabitDayDoneInput): Promise<Habit> {
  return runRequest("mutation", null, () => {
    if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      throw new FakeApiError(
        "INVALID_DAY_INDEX",
        `Day index must be an integer from 0 through 6; received ${dayIndex}`,
      );
    }

    const habit = serverHabits.find((item) => item.id === habitId);
    if (!habit) {
      throw new FakeApiError(
        "HABIT_NOT_FOUND",
        `Habit "${habitId}" was not found`,
      );
    }

    const lastSevenDays = [...habit.lastSevenDays];
    const wasDone = lastSevenDays[dayIndex];
    if (wasDone === done) return copyHabit(habit);

    lastSevenDays[dayIndex] = done;
    const activeDaysCount = lastSevenDays.filter(Boolean).length;
    const rawStreak = done ? habit.streak + 1 : habit.streak - 1;
    const updatedHabit = {
      ...habit,
      lastSevenDays,
      streak: Math.max(rawStreak, activeDaysCount, 0),
    };

    serverHabits = serverHabits.map((item) =>
      item.id === habitId ? updatedHabit : item,
    );
    return copyHabit(updatedHabit);
  });
}

// Creates, stores, and returns a new habit with an empty seven-day history.
export async function addHabit(input: AddHabitInput): Promise<Habit> {
  return runRequest("mutation", null, () => {
    const newHabit: Habit = {
      id: `habit-${String(nextHabitNumber).padStart(3, "0")}`,
      name: input.name.trim(),
      frequency: input.frequency,
      streak: 0,
      doneToday: false,
      lastSevenDays: [false, false, false, false, false, false, false],
    };

    nextHabitNumber += 1;
    serverHabits = [...serverHabits, newHabit];
    return copyHabit(newHabit);
  });
}
