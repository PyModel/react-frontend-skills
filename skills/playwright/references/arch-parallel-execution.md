---
title: Enable Parallel Test Execution
impact: CRITICAL
impactDescription: 2-10× faster test suites
tags: arch, parallel, workers, performance, configuration
---

## Enable Parallel Test Execution

Running tests sequentially wastes CI time. Playwright supports parallel execution at both file and test level—configure workers based on your CI resources.

**Incorrect (sequential execution):**

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 1, // Forces sequential execution
  fullyParallel: false,
});

// Test suite takes 10 minutes
```

**Correct (parallel execution):**

```typescript
// playwright.config.ts
export default defineConfig({
  // CI: 4 workers. Locally, undefined = Playwright's default (half the CPU cores)
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
});

// tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';

// fullyParallel: true already runs these tests in parallel; no describe.configure needed

test('loads user stats', async ({ page }) => {
  await page.goto('/dashboard/stats');
  await expect(page.getByTestId('stats-panel')).toBeVisible();
});

test('loads notifications', async ({ page }) => {
  await page.goto('/dashboard/notifications');
  await expect(page.getByTestId('notification-list')).toBeVisible();
});

test('loads settings', async ({ page }) => {
  await page.goto('/dashboard/settings');
  await expect(page.getByTestId('settings-form')).toBeVisible();
});
```

**Tests that share one resource: use a lock (Playwright 1.63+):**

Don't drop to `workers: 1` or serial mode because a few tests share one account, database row or external sandbox. Give those tests the same `lock` name: Playwright runs them one at a time, across files, workers and projects, while everything else stays parallel.

```typescript
test('updates billing address', { lock: 'billing-account' }, async ({ page }) => {
  // ...
});

test.describe('plan changes', { lock: ['billing-account', 'stripe-sandbox'] }, () => {
  // every test here holds both locks
});
```

In a file that is not fully parallel (the default or serial mode), a lock on any test is held for the whole file.

**Lock a whole file or describe group (Playwright 1.64+):**

`test.describe.configure({ lock })` adds locks to the enclosing file or describe group without repeating the option on every test. Repeated calls add locks; they do not remove existing ones.

```typescript
test.describe.configure({ lock: 'user-settings' });
```

**Find hidden test-order dependencies with `--shuffle` (Playwright 1.64+):**

```bash
npx playwright test --shuffle
# Running 42 tests using 4 workers, shuffle seed 271828182

# Re-run the same order to reproduce a failure
npx playwright test --shuffle 271828182
```

Test files and (in parallel mode) individual tests run in random order; tests that must run together, such as a serial suite, keep their order. A test that only passes after another test ran is not isolated: fix it rather than pinning the order.

**When NOT to use parallel execution:**
- Tests with intentional sequential dependencies (prefer making them independent)
- Resources that can't be isolated per test even with locks

Reference: [Playwright Parallelism](https://playwright.dev/docs/test-parallel) · [Test locks](https://playwright.dev/docs/test-parallel#test-locks) · [Playwright 1.64 release notes](https://playwright.dev/docs/release-notes#version-164)
