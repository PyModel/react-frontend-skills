---
title: Test Server Components Correctly
impact: MEDIUM
impactDescription: validates RSC behavior end-to-end
tags: next, rsc, server-components, app-router, testing
---

## Test Server Components Correctly

React Server Components (RSC) render on the server and stream HTML to the client. Test them through E2E tests that verify the final rendered output, not unit tests.

**Incorrect (trying to unit test RSC):**

```typescript
// This won't work - RSC can't be tested with React Testing Library
import { render } from '@testing-library/react';
import { UserProfile } from './UserProfile'; // Server Component

test('renders user profile', () => {
  // Error: async Server Components can't render client-side
  render(<UserProfile userId="123" />);
});
```

**Correct (E2E test for RSC):**

```typescript
// tests/user-profile.spec.ts
test('server component renders user data', async ({ page }) => {
  await page.goto('/user/123');

  // RSC has rendered and streamed to client
  await expect(page.getByTestId('user-name')).toHaveText('John Doe');
  await expect(page.getByTestId('user-email')).toHaveText('john@example.com');

  // Server-fetched data is present
  await expect(page.getByTestId('user-posts')).toHaveCount(5);
});
```

**Mock the API boundary:**

Playwright's `page.route` intercepts browser requests only. A Server Component's server-side `fetch` runs in the Next.js server process, so for RSC data use a test API or run MSW in the app process. The example below mocks a browser request.

```typescript
// tests/user-profile.spec.ts
test('client fetch with mocked data', async ({ page }) => {
  await page.route('/api/user/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      }),
    });
  });

  await page.goto('/user/123');

  await expect(page.getByTestId('user-name')).toHaveText('Test User');
});
```

**Test Suspense boundaries:**

```typescript
test('shows loading state then content', async ({ page }) => {
  // Slow down API to see loading state
  await page.route('/api/slow-data', async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.fulfill({ body: JSON.stringify({ data: 'loaded' }) });
  });

  await page.goto('/dashboard');

  // Suspense fallback should show first
  await expect(page.getByTestId('loading-skeleton')).toBeVisible();

  // Then real content streams in
  await expect(page.getByTestId('dashboard-content')).toBeVisible();
  await expect(page.getByTestId('loading-skeleton')).toBeHidden();
});
```

Reference: [Testing Next.js](https://nextjs.org/docs/app/guides/testing)
