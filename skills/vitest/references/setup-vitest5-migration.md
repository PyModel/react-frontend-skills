---
title: Plan the Vitest 5 Migration Deliberately
impact: CRITICAL
impactDescription: avoids hard breaks from removed options, matcher changes, and id shifts
tags: vitest, vitest-5, migration, setup, versions
---

## Plan the Vitest 5 Migration Deliberately

Vitest 5.0 (September 2026) requires Node.js ≥ 22.12.0 and Vite ≥ 6.4.0. The test API is largely stable, but several long-standing options and matcher behaviors changed hard. Vitest 4.1 remains supported for important backports; plan upgrades rather than drifting between majors.

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

**Notes:**

- Performance gains are real but not behavior: browser mode pre-bundles its runtime, prewarms the browser during server start, and opens sessions adaptively; installs are smaller because dependencies are bundled.
- Run `vitest --clearCache` once after upgrading, then the full suite, to surface vm/module-cache edge cases.
