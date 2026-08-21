---
title: Wait for Observable Readiness, Not Network Idle
impact: HIGH
impactDescription: follows Playwright's web-first readiness model and avoids polling/WebSocket hangs
tags: wait, networkidle, assertions, readiness, navigation
---

## Wait for Observable Readiness, Not Network Idle

Playwright explicitly discourages using `waitUntil: 'networkidle'` for tests. A quiet network is not the same as a ready UI, and polling, analytics, service workers, or long-lived connections can keep a page busy indefinitely. Navigate normally, then assert the state the user needs.

**Incorrect (global network heuristic):**

```typescript
test('shows analytics', async ({ page }) => {
  await page.goto('/analytics', { waitUntil: 'networkidle' })
  await expect(page.getByTestId('revenue-chart')).toBeVisible()
})
```

**Correct (web-first UI contract):**

```typescript
test('shows analytics', async ({ page }) => {
  await page.goto('/analytics')

  await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  await expect(page.getByTestId('revenue-chart')).toBeVisible()
  await expect(page.getByTestId('users-chart')).toBeVisible()
})
```

If the response itself is the contract, start a targeted wait before the action that triggers it:

```typescript
test('refreshes dashboard data', async ({ page }) => {
  await page.goto('/dashboard')

  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/dashboard-data') && response.ok()
  )

  await page.getByRole('button', { name: 'Refresh' }).click()
  await responsePromise
  await expect(page.getByTestId('dashboard-content')).toContainText('Updated')
})
```

Do not replace `networkidle` with a fixed sleep:

```typescript
await page.goto('/analytics')
await page.waitForTimeout(2_000)
```

For pages with polling or long-lived connections, assert the user-visible state directly:

```typescript
await page.goto('/chat')
await expect(page.getByTestId('chat-messages')).toBeVisible()
```

Use `waitUntil: 'domcontentloaded'`, `'load'`, or `'commit'` only when that browser event is itself relevant. Prefer locators and web-first assertions for application readiness.

Reference: [Playwright page.goto waitUntil](https://playwright.dev/docs/api/class-page#page-goto-option-wait-until)
