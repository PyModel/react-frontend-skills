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
// v4-era config and tests
describe.sequential('migration flow', () => {
  test('shows text', async ({ page }) => {
    // toHaveTextContent did partial matching in v4
    await expect(page.getByRole('status')).toHaveTextContent(/Saving\.\.\./)
  })
})
// v5: describe.sequential is gone (use concurrent: false) and
// toHaveTextContent is strict equality; RegExp moves to toMatchTextContent
```

**Correct (v5 semantics):**

```typescript
// Opt out of inherited concurrency explicitly
describe('migration flow', () => {
  test('shows text', async ({ page }) => {
    await expect(page.getByRole('status')).toMatchTextContent(/Saving\.\.\./)
  })
})
```

**Breaking changes to sweep for:**

- `test.sequential`, `describe.sequential`, and the `sequential` option are removed — use `concurrent: false`.
- Browser-mode `toHaveTextContent` is strict equality now; partial/RegExp matching moved to the new `toMatchTextContent`.
- `VITEST_POOL_ID` and `VITEST_WORKER_ID` are 1-based (were 0-based) — per-worker resources (e.g., database names) must update.
- Interpolated `$placeholder` values in `test.for` titles are no longer quoted; truncation is controlled by `taskTitleValueFormatTruncate` (default 40).
- `clearCache` is stable (out of experimental); istanbul coverage moved to the maintained `@vitest/istanbuljs` package.

**Notes:**

- Performance gains are real but not behavior: browser mode pre-bundles its runtime, prewarms the browser during server start, and opens sessions adaptively; installs are smaller because dependencies are bundled.
- Run the full suite once with `--no-cache` after upgrading to surface vm/module-cache edge cases.
