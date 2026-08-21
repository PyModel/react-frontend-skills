---
title: Use Retries to Detect and Diagnose Flakiness
impact: MEDIUM
impactDescription: classifies flaky tests and captures retry diagnostics without masking root causes
tags: perf, retries, flaky, reliability, configuration
---

## Use Retries to Detect and Diagnose Flakiness

Retries let Playwright classify a test as flaky when it fails first and passes on retry. Use a small CI retry budget with traces to collect evidence, not to redefine an unstable test as healthy. Fix deterministic waits, shared state, and external dependencies at their source.

**Incorrect (no retries, tests fail on first flake):**

```typescript
// playwright.config.ts
export default defineConfig({
  // No retries configured
  // Any flaky test fails the entire CI run
});
```

**Correct (strategic retries):**

```typescript
// playwright.config.ts
export default defineConfig({
  // More retries in CI where flakiness is more common
  retries: process.env.CI ? 2 : 0,

  // Use reporter to track which tests needed retries
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
});
```

**Retry configuration options:**

```typescript
// playwright.config.ts
export default defineConfig({
  retries: 2,

  // Only rerun failed tests, not entire file
  use: {
    trace: 'on-first-retry', // Capture trace on retry for debugging
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

**Per-test retry configuration:**

```typescript
// tests/critical.spec.ts
import { test } from '@playwright/test';

// Override only when a documented external boundary needs different policy.
test.describe('third-party sandbox', () => {
  test.describe.configure({ retries: 1 })

  test('completes the sandbox callback', async ({ page }) => {
    // Keep diagnostics and track any flaky classification as a defect.
  })
})
```

**Identify and fix flaky tests:**

```typescript
// Instead of relying on retries, fix the root cause

// BAD: Flaky due to timing
test('shows notification', async ({ page }) => {
  await page.click('#trigger');
  await page.waitForTimeout(1000); // Hoping it's enough
  await expect(page.getByText('Done')).toBeVisible();
});

// GOOD: Deterministic wait
test('shows notification', async ({ page }) => {
  await page.click('#trigger');
  await expect(page.getByText('Done')).toBeVisible(); // Auto-retries
});
```

**Monitor retry rate:**

```bash
# See which tests are flaky
npx playwright test --reporter=list

# Output shows:
# ✓ [1/2] test name (1.2s) [retry #1]
# Any flaky classification still exits green by default; surface and track it
```

Reference: [Playwright Retries](https://playwright.dev/docs/test-retries)
