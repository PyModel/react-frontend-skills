---
title: Avoid XPath Selectors
impact: HIGH
impactDescription: DOM-structure selectors are brittle and do not express user-facing contracts
tags: loc, xpath, performance, selectors, anti-pattern
---

## Avoid XPath Selectors

XPath selectors often encode DOM structure rather than user-visible behavior, so they break easily when markup changes. Prefer Playwright's role, label, text, test-id, and filtering locators. Treat maintainability and actionability as the reason; selector timing depends on the page and browser.

**Incorrect (XPath selectors):**

```typescript
// tests/table.spec.ts
test('edit user in table', async ({ page }) => {
  await page.goto('/admin/users');

  // Slow: full DOM traversal
  await page.locator('//table//tr[contains(.,"john@example.com")]//button[text()="Edit"]').click();

  // Brittle: breaks if table structure changes
  await page.locator('//div[@class="container"]/div[2]/table/tbody/tr[3]/td[4]/button').click();

  // Hard to read and maintain
  await page.locator('//button[ancestor::tr[descendant::td[text()="Active"]]]').click();
});
```

**Correct (role-based and CSS alternatives):**

```typescript
// tests/table.spec.ts
test('edit user in table', async ({ page }) => {
  await page.goto('/admin/users');

  // Find row by content, then action button
  const userRow = page.getByRole('row', { name: /john@example.com/ });
  await userRow.getByRole('button', { name: 'Edit' }).click();

  // Or use data-testid for complex tables
  await page.getByTestId('user-row-john').getByRole('button', { name: 'Edit' }).click();
});
```

**Alternative approaches for complex queries:**

```typescript
// Filter locators instead of XPath
const activeUsers = page.getByRole('row').filter({
  has: page.getByText('Active'),
});
await activeUsers.first().getByRole('button', { name: 'Edit' }).click();

// Chain locators for specificity
await page
  .getByRole('table', { name: 'Users' })
  .getByRole('row')
  .filter({ hasText: 'john@example.com' })
  .getByRole('button', { name: 'Edit' })
  .click();
```

Reference: [Playwright Locator Best Practices](https://playwright.dev/docs/best-practices#use-locators)
