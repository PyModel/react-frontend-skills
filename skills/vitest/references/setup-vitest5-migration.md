---
title: Plan the Vitest 5 Migration Deliberately
impact: CRITICAL
impactDescription: avoids hard breaks from removed options, matcher changes, and id shifts
tags: vitest, vitest-5, migration, setup, versions
---

## Plan the Vitest 5 Migration Deliberately

Vitest 5.0 (September 2026) requires Node.js ≥ 22.12.0 and Vite ≥ 6.4.0 as a peer dependency. The test API is largely stable, but several long-standing options and matcher behaviors changed hard. Vitest 4.1 remains supported for important backports; plan upgrades rather than drifting between majors.

**Incorrect (assuming v4 configs run untouched):**

```typescript
// v4-era config and tests (browser mode)
import { page } from 'vitest/browser'

describe.sequential('migration flow', () => {
  test('shows text', async () => {
    // toHaveTextContent did partial matching in v4
    await expect.element(page.getByRole('status')).toHaveTextContent(/Saving\.\.\./)
  })
})
// v5: describe.sequential is gone (use concurrent: false) and
// toHaveTextContent is strict equality; RegExp moves to toMatchTextContent
```

**Correct (v5 semantics):**

```typescript
import { page } from 'vitest/browser'

// Opt out of inherited concurrency explicitly
describe('migration flow', { concurrent: false }, () => {
  test('shows text', async () => {
    await expect.element(page.getByRole('status')).toMatchTextContent(/Saving\.\.\./)
  })
})
```

**Breaking changes to sweep for:**

- `clearMocks` now defaults to `true` — mock call history is cleared before every test; set `clearMocks: false` if a test asserts on calls recorded in setup files, module scope, or `beforeAll`.
- `test.sequential`, `describe.sequential`, and the `sequential` option are removed — use `concurrent: false`.
- Browser-mode `toHaveTextContent` is strict equality now; partial/RegExp matching moved to the new `toMatchTextContent`.
- `VITEST_POOL_ID` and `VITEST_WORKER_ID` are 1-based (were 0-based) — per-worker resources (e.g., database names) must update.
- Interpolated `$placeholder` values in `test.for` titles are no longer quoted; truncation is controlled by `taskTitleValueFormatTruncate` (default 40).
- `clearCache` is stable (out of experimental); `@vitest/coverage-istanbul` now uses Vitest-maintained `@vitest/istanbul-lib-*` forks internally (the package you install is unchanged).
- `vi.mock`, `vi.unmock` and `vi.hoisted` must be at module top level. Nested calls are a transform error and the whole file fails. Per-test mocks use `vi.doMock` plus a dynamic `import()` (see `mock-vi-mock-hoisting`).
- Inline `projects` inherit the root config: arrays such as `include` and `setupFiles` are concatenated, not replaced. Set `extends: false` on a project that must not inherit (see `env-per-file-override`).
- Config files are no longer looked up in parent directories. Running `vitest` from a subfolder silently drops the config (the symptom is `describe is not defined`). Run from the config's directory, or pass `--config` and `--dir`.
- Reports and artifacts go under `.vitest/` (`blob/`, `json/`, `junit/`, HTML at `.vitest/index.html`). The `json` and `junit` reporters write files instead of stdout; pass `{ stdout: true }` per reporter to pipe them. Add `.vitest` to `.gitignore` (see `perf-run-mode-ci`).
- Deprecated entry points are removed: `vitest/suite`, `vitest/runners`, `vitest/coverage`, `vitest/snapshot`, `vitest/reporters`, `vitest/environments` and `vitest/mocker`. Import from `vitest`, `vitest/config`, `vitest/node` or `vitest/runtime`, and `@vitest/mocker` for the mocker.
- `vite` is no longer a dependency of `vitest`, only a peer (`^6.4.0 || ^7 || ^8`). List it in `devDependencies`; Yarn does not install it for you.
- The benchmark API is now a `bench` test-context fixture used in `*.bench.ts` files, run by `vitest bench` (see `perf-bench-test-context`).
- `toThrow('')` now matches any error message. Use `toThrow()` for "throws anything" or `toThrow(/^$/)` for an empty message.
- `expect.poll` fails when its `timeout` expires, even if the callback would resolve later. The callback receives an `AbortSignal` to cancel in-flight work.

**Notes:**

- Performance gains are real but not behavior: browser mode pre-bundles its runtime, prewarms the browser during server start, and opens sessions adaptively; installs are smaller because dependencies are bundled.
- Run `vitest --clearCache` once after upgrading, then the full suite, to surface vm/module-cache edge cases.

Reference: [Vitest migration guide](https://vitest.dev/guide/migration) · [Vitest 5.0.0 release](https://github.com/vitest-dev/vitest/releases/tag/v5.0.0)
