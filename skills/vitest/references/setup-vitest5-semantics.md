---
title: Vitest 5 Runtime Semantics
impact: HIGH
impactDescription: prevents wrong suite options, matchers, worker ids, import paths, and missing vite
tags: vitest, vitest-5, setup, concurrency, browser-mode, entry-points
---

## Vitest 5 Runtime Semantics

Write Vitest 5 code against these facts.

- **Concurrency.** There is no `test.sequential`, `describe.sequential`, or `sequential` option. A test or suite opts out of inherited or configured concurrency with `concurrent: false`; the global switch is `sequence.concurrent`.
- **Browser-mode text matchers.** `toHaveTextContent` is strict string equality and does not accept a RegExp. `toMatchTextContent` does partial string and RegExp matching.
- **Worker ids.** `VITEST_POOL_ID` and `VITEST_WORKER_ID` are 1-based, ranging from `1` to the worker count. Node and browser tests run in separate pools, so the same value can appear in both.
- **Entry points.** Import from `vitest`, `vitest/config`, `vitest/node` (coverage and reporters), and `vitest/runtime` (environments and snapshot). The runner is `TestRunner` from `vitest`; the mocker is the `@vitest/mocker` package.
- **Vite.** `vite` is a peer dependency, so the project's installed Vite is the one Vitest uses. List it in `devDependencies`; npm, pnpm, Bun, and Deno install peers automatically, Yarn does not.

**Incorrect:**

```typescript
describe.sequential('flow', () => {
  test('shows text', async () => {
    await expect.element(page.getByRole('status')).toHaveTextContent(/Saving/)
  })
})
```

**Correct:**

```typescript
import { page } from 'vitest/browser'

describe('flow', { concurrent: false }, () => {
  test('shows text', async () => {
    await expect.element(page.getByRole('status')).toMatchTextContent(/Saving/)
    await expect.element(page.getByRole('status')).toHaveTextContent('Saving...')
  })
})
```

```typescript
// per-worker resource, ids start at 1
const db = `test_db_${process.env.VITEST_WORKER_ID}`
```

```bash
npm i -D vitest vite
```

Reference: [Vitest guide](https://vitest.dev/guide/)
