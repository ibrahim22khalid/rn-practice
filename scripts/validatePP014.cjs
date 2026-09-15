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
  fetchHabit,
  getFakeServerHabit,
  loseNextMutationResponse,
  resetFakeHabitsServer,
} = require("../src/features/habits/api/habitsApi.ts");
const {
  createSetHabitDoneMutationOptions,
} = require("../src/features/habits/api/habitMutations.ts");
const {
  createHabitListParams,
  habitKeys,
} = require("../src/features/habits/api/habitQueries.ts");

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
  configureFakeApiDelays({
    defaultMs: 0,
    listMs: 0,
    mutationMs: 0,
    searchMs: {},
  });

  const habitId = "habit-001";
  const variables = Object.freeze({ habitId, done: true });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const listKey = habitKeys.list(createHabitListParams(""));
  const detailKey = habitKeys.detail(habitId);
  const initialHabit = getFakeServerHabit(habitId);

  assert.ok(initialHabit);
  assert.equal(initialHabit.doneToday, false);
  queryClient.setQueryData(listKey, [initialHabit]);
  queryClient.setQueryData(detailKey, initialHabit);

  const mutation = createSetHabitDoneMutationOptions(queryClient);
  const rollbackContext = await mutation.onMutate(variables);

  assert.equal(queryClient.getQueryData(listKey)[0].doneToday, true);
  assert.equal(queryClient.getQueryData(detailKey).doneToday, true);
  assert.equal(getFakeServerHabit(habitId).doneToday, false);

  loseNextMutationResponse();
  await expectReject(
    mutation.mutationFn(variables),
    "MUTATION_RESPONSE_LOST",
  );
  assert.equal(getFakeServerHabit(habitId).doneToday, true);

  mutation.onError(
    new Error("The response was lost"),
    variables,
    rollbackContext,
  );
  assert.equal(queryClient.getQueryData(listKey)[0].doneToday, false);
  assert.equal(queryClient.getQueryData(detailKey).doneToday, false);
  assert.equal(getFakeServerHabit(habitId).doneToday, true);

  const authoritativeDetail = await fetchHabit(habitId);
  queryClient.setQueryData(detailKey, authoritativeDetail);
  assert.equal(queryClient.getQueryData(listKey)[0].doneToday, false);
  assert.equal(queryClient.getQueryData(detailKey).doneToday, true);
  assert.equal(getFakeServerHabit(habitId).doneToday, true);

  const retryContext = await mutation.onMutate(variables);
  const repeatedResult = await mutation.mutationFn(variables);
  await mutation.onSuccess(repeatedResult, variables, retryContext);

  assert.equal(queryClient.getQueryData(listKey)[0].doneToday, true);
  assert.equal(queryClient.getQueryData(detailKey).doneToday, true);
  assert.equal(getFakeServerHabit(habitId).doneToday, true);

  console.log("PUR-27 PP014 lost-response validation passed");
  console.log(
    JSON.stringify(
      {
        afterRollback: { list: false, detail: false, server: true },
        afterDetailRefetch: { list: false, detail: true, server: true },
        afterRepeatedFinalState: { list: true, detail: true, server: true },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
