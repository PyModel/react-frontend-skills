---
title: Wait for Hydration Before Interacting
impact: MEDIUM
impactDescription: prevents hydration mismatch errors
tags: next, hydration, ssr, client, interaction
---

## Wait for Hydration Before Interacting

Next.js renders HTML on the server, then hydrates it with JavaScript. Interacting before hydration completes can cause errors or unresponsive elements.

**Incorrect (interact before hydration):**

```typescript
test('submit form', async ({ page }) => {
  await page.goto('/contact');

  // May interact with server-rendered HTML before JS loads
  // Button might not have click handler attached yet
  await page.getByRole('button', { name: 'Submit' }).click();

  // Nothing happens - JS wasn't ready
});
```

**Correct (wait for hydration indicators):**

```typescript
test('submit form', async ({ page }) => {
  await page.goto('/contact');

  // Prefer a product-specific ready state. If the app exposes an explicit
  // hydration marker, assert that marker rather than network activity.
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');

  await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

  // Now safe to interact
  await page.getByRole('button', { name: 'Submit' }).click();
});
```

**Add hydration marker in your app:**

```tsx
// components/HydrationMarker.tsx
'use client';

import { useEffect } from 'react';

export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
    return () => {
      delete document.documentElement.dataset.hydrated;
    };
  }, []);

  return null;
}

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <HydrationMarker />
      </body>
    </html>
  );
}
```

**Wait for specific interactive behavior:**

```typescript
test('interactive dropdown works', async ({ page }) => {
  await page.goto('/settings');

  const dropdown = page.getByRole('combobox', { name: 'Language' });

  // Wait for dropdown to be interactive (hydrated)
  await dropdown.waitFor({ state: 'visible' });

  // Verify it responds to click (JS attached)
  await dropdown.click();
  await expect(page.getByRole('option', { name: 'English' })).toBeVisible();
});
```

**Incorrect (network quiet is not a hydration contract):**

```typescript
test('fully hydrated page', async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Action' }).click()
})
```

Do not use `networkidle` as a hydration signal; Playwright discourages it for testing, and network quiet does not prove React attached the required handlers. Prefer an observable product state. Add a dedicated marker only when no user-visible readiness contract exists.

Reference: [Next.js Hydration](https://nextjs.org/docs/messages/react-hydration-error)
