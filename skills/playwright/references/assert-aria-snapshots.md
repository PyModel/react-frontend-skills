---
title: Assert Accessibility Structure with Aria Snapshots
impact: MEDIUM
impactDescription: resilient UI structure assertions that survive styling changes
tags: playwright, aria, snapshot, accessibility, assertions
---

## Assert Accessibility Structure with Aria Snapshots

ARIA snapshots capture a page or element's accessibility tree as YAML — roles, names, and hierarchy without classes or styles. Asserting against them verifies what users and assistive tech actually see, and unlike DOM snapshots they survive CSS refactors.

**Incorrect (asserting on implementation details):**

```typescript
test('dashboard renders', async ({ page }) => {
  await page.goto('/dashboard')
  // Breaks on any markup/styling change; says nothing
  // about the page's semantic structure
  await expect(page.locator('div.container > section:nth-child(2)')).toBeVisible()
})
```

**Correct (inline aria snapshot):**

```typescript
test('dashboard renders', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/')

  await expect(page).toMatchAriaSnapshot(`
    - heading "todos"
    - textbox "What needs to be done?"
  `)
})
```

**Store baselines in separate files:**

```typescript
// Saves/loads main.aria.yml next to the test file
await expect(page.getByRole('main')).toMatchAriaSnapshot({
  name: 'main.aria.yml',
})
```

**Generate a baseline first, then tighten it:**

```typescript
// Empty template records the current structure; run with
// npx playwright test --update-snapshots to write it
await expect(page.getByRole('main')).toMatchAriaSnapshot('')
```

**Notes:**

- `locator.ariaSnapshot()` captures the YAML string directly; options include `depth` (limit tree size), `boxes` (append bounding boxes), and `mode: "ai"` for AI-optimized output.
- Snapshot files use the `.aria.yml` extension and are stored in a directory named after the test file by default.
- Update stale baselines with `npx playwright test --update-snapshots` after intentional structure changes.
- Combine with [wait-web-first-assertions](wait-web-first-assertions.md) — `toMatchAriaSnapshot` is a web-first assertion that auto-waits.
