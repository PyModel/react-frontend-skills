---
title: Rerun Only Affected or Failed Tests Locally
impact: MEDIUM
impactDescription: skips unchanged tests between runs without needing git
tags: perf, since-last-run, last-failed, affected-tests, cache, local-dev
---

## Rerun Only Affected or Failed Tests Locally

> **Vitest 5.1+.** Both flags read the Vitest cache, so keep the cache enabled. `vitest run --clearCache` deletes the records and the next run is a full run.

Re-running the whole suite after every small edit wastes time. Vitest 5.1 can select tests from what it recorded on the previous run, with no git history required (it works in a fresh container, a worktree or a non-repository directory).

**Incorrect (full suite after every edit, or hand-picked file paths):**

```bash
npx vitest run
npx vitest run src/cart/cart.test.ts src/cart/totals.test.ts # easy to miss a dependent test
```

**Correct (rerun what the last edit could affect):**

```bash
# First run executes everything and records the files each test loaded.
# Later runs execute only tests whose recorded files changed or were deleted.
npx vitest run --since-last-run
```

The records include dynamic imports, mocks, setup files and snapshot files. A new or never-recorded test file always runs, and a test file that failed on its last run keeps running until it passes. Each run updates the records of the tests it ran, so only the next edit selects tests again.

**Rerun only the failures from the last run:**

```bash
npx vitest run --last-failed

# combine with other filters
npx vitest run --last-failed -t login
```

**Notes:**

- Use these for local feedback loops. Keep `vitest run` (full suite) in CI so a changed dependency outside the recorded files cannot hide a failure; see [perf-run-mode-ci](perf-run-mode-ci.md).
- `--since-last-run` is for local dev; `--changed` (git-based) remains the option when you need "changed since a commit".

Reference: [Vitest 5.1 announcement](https://vitest.dev/blog/vitest-5-1) · [Running only affected tests](https://vitest.dev/guide/recipes/affected-tests) · [CLI](https://vitest.dev/guide/cli)
