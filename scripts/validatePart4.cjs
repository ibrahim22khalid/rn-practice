const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

global.__DEV__ = true;

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { QueryClient } = require("@tanstack/react-query");
const {
  configureFakeApiDelays,
  failNextMutation,
  getFakeServerHabit,
  resetFakeHabitsServer,
  setHabitDone,
} = require("../src/features/habits/api/habitsApi.ts");
const {
  createMutationSubmissionGuard,
  createSetHabitDoneMutationOptions,
} = require("../src/features/habits/api/habitMutations.ts");
const {
  createHabitListParams,
  habitKeys,
} = require("../src/features/habits/api/habitQueries.ts");

function freshQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function setZeroDelays() {
  configureFakeApiDelays({
    defaultMs: 0,
    listMs: 0,
    mutationMs: 0,
    searchMs: {},
  });
}

async function expectReject(promise, code) {
  try {
    await promise;
    assert.fail(`Expected rejection with ${code}`);
  } catch (error) {
    assert.equal(error.code, code);
  }
}

async function main() {
  resetFakeHabitsServer();
  setZeroDelays();

  const habitId = "habit-001";
  const otherHabitId = "habit-011";
  const initialHabit = getFakeServerHabit(habitId);
  const otherHabit = getFakeServerHabit(otherHabitId);
  assert.ok(initialHabit);
  assert.ok(otherHabit);
  assert.equal(initialHabit.doneToday, false);

  const guard = createMutationSubmissionGuard();
  assert.equal(guard.tryStart(), true);
  assert.equal(guard.tryStart(), false, "duplicate submission must be rejected");
  guard.finish();
  assert.equal(guard.tryStart(), true);
  guard.finish();

  failNextMutation();
  await expectReject(
    setHabitDone({ habitId, done: true }),
    "MUTATION_FAILED",
  );
  assert.equal(
    getFakeServerHabit(habitId).doneToday,
    false,
    "forced failure must happen before the server write",
  );
  const afterOneShot = await setHabitDone({ habitId, done: true });
  assert.equal(afterOneShot.doneToday, true);
  assert.equal(getFakeServerHabit(habitId).doneToday, true);
  const repeated = await setHabitDone({ habitId, done: true });
  assert.equal(repeated.doneToday, true, "repeating final state must be idempotent");
  repeated.name = "client-only mutation";
  assert.notEqual(
    getFakeServerHabit(habitId).name,
    repeated.name,
    "server must not return its mutable internal object",
  );

  resetFakeHabitsServer();
  setZeroDelays();
  const target = getFakeServerHabit(habitId);
  const unrelatedDetail = getFakeServerHabit(otherHabitId);
  const queryClient = freshQueryClient();
  const allKey = habitKeys.list(createHabitListParams(""));
  const heartKey = habitKeys.list(createHabitListParams("heart"));
  const healingKey = habitKeys.list(createHabitListParams("healing"));
  const detailKey = habitKeys.detail(habitId);
  const otherDetailKey = habitKeys.detail(otherHabitId);
  const allSnapshot = [{ ...target }, { ...unrelatedDetail }];
  const heartSnapshot = [{ ...target }];
  const healingSnapshot = [];
  const detailSnapshot = { ...target };
  const otherDetailSnapshot = { ...unrelatedDetail };

  queryClient.setQueryData(allKey, allSnapshot);
  queryClient.setQueryData(heartKey, heartSnapshot);
  queryClient.setQueryData(healingKey, healingSnapshot);
  queryClient.setQueryData(detailKey, detailSnapshot);
  queryClient.setQueryData(otherDetailKey, otherDetailSnapshot);

  const events = [];
  const originalCancel = queryClient.cancelQueries.bind(queryClient);
  const originalSet = queryClient.setQueryData.bind(queryClient);
  const originalInvalidate = queryClient.invalidateQueries.bind(queryClient);
  queryClient.cancelQueries = async (filters, options) => {
    events.push({ type: "cancel", queryKey: filters.queryKey, exact: filters.exact });
    return originalCancel(filters, options);
  };
  queryClient.setQueryData = (queryKey, updater, options) => {
    events.push({ type: "write", queryKey });
    return originalSet(queryKey, updater, options);
  };
  queryClient.invalidateQueries = async (filters, options) => {
    events.push({ type: "invalidate", queryKey: filters.queryKey });
    return originalInvalidate(filters, options);
  };

  const mutation = createSetHabitDoneMutationOptions(queryClient);
  assert.equal(mutation.retry, false, "side-effecting mutation must not auto-retry");
  const variables = Object.freeze({ habitId, done: true });

  failNextMutation();
  const rollbackContext = await mutation.onMutate(variables);
  assert.deepEqual(
    events.slice(0, 2).map(({ type, queryKey, exact }) => ({
      type,
      queryKey,
      exact,
    })),
    [
      { type: "cancel", queryKey: habitKeys.lists(), exact: undefined },
      { type: "cancel", queryKey: detailKey, exact: true },
    ],
    "list prefix and exact detail must be cancelled before writes",
  );
  assert.equal(rollbackContext.listSnapshots.length, 2);
  assert.ok(
    rollbackContext.listSnapshots.every(({ queryKey }) =>
      [JSON.stringify(allKey), JSON.stringify(heartKey)].includes(
        JSON.stringify(queryKey),
      ),
    ),
  );
  assert.strictEqual(rollbackContext.previousDetail, detailSnapshot);

  const optimisticAll = queryClient.getQueryData(allKey);
  const optimisticHeart = queryClient.getQueryData(heartKey);
  const optimisticDetail = queryClient.getQueryData(detailKey);
  assert.equal(optimisticAll[0].doneToday, true);
  assert.equal(optimisticHeart[0].doneToday, true);
  assert.equal(optimisticDetail.doneToday, true);
  assert.notStrictEqual(optimisticAll, allSnapshot);
  assert.notStrictEqual(optimisticAll[0], allSnapshot[0]);
  assert.strictEqual(optimisticAll[1], allSnapshot[1]);
  assert.equal(allSnapshot[0].doneToday, false, "snapshot object was mutated");
  assert.equal(detailSnapshot.doneToday, false, "detail snapshot was mutated");
  assert.strictEqual(queryClient.getQueryData(healingKey), healingSnapshot);
  assert.strictEqual(queryClient.getQueryData(otherDetailKey), otherDetailSnapshot);

  await expectReject(mutation.mutationFn(variables), "MUTATION_FAILED");
  mutation.onError(new Error("controlled failure"), variables, rollbackContext);
  assert.deepEqual(queryClient.getQueryData(allKey), allSnapshot);
  assert.deepEqual(queryClient.getQueryData(heartKey), heartSnapshot);
  assert.deepEqual(queryClient.getQueryData(detailKey), detailSnapshot);
  assert.equal(getFakeServerHabit(habitId).doneToday, false);

  const retryContext = await mutation.onMutate(variables);
  const serverHabit = await mutation.mutationFn(variables);
  await mutation.onSuccess(serverHabit, variables, retryContext);
  assert.equal(serverHabit.doneToday, true);
  assert.deepEqual(queryClient.getQueryData(detailKey), serverHabit);
  assert.strictEqual(queryClient.getQueryData(otherDetailKey), otherDetailSnapshot);
  assert.equal(queryClient.getQueryState(allKey).isInvalidated, true);
  assert.equal(queryClient.getQueryState(heartKey).isInvalidated, true);
  assert.equal(queryClient.getQueryState(healingKey).isInvalidated, true);
  assert.notEqual(queryClient.getQueryState(detailKey).isInvalidated, true);
  assert.deepEqual(
    events.filter(({ type }) => type === "invalidate").at(-1).queryKey,
    habitKeys.lists(),
  );

  console.log("PUR-25 Part 4 deterministic validation passed");
  console.log(JSON.stringify({
    contract: variables,
    cancelled: [habitKeys.lists(), detailKey],
    snapshottedLists: rollbackContext.listSnapshots.map(({ queryKey }) => queryKey),
    rollbackServerDone: false,
    retryServerDone: getFakeServerHabit(habitId).doneToday,
    detailMatchesServer:
      JSON.stringify(queryClient.getQueryData(detailKey)) ===
      JSON.stringify(serverHabit),
    invalidated: habitKeys.lists(),
    unrelatedDetailUnchanged:
      queryClient.getQueryData(otherDetailKey) === otherDetailSnapshot,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
