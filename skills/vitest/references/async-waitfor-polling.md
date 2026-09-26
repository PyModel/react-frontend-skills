---
title: Use vi.waitFor for Async Conditions
impact: CRITICAL
impactDescription: Replaces arbitrary timeouts with condition-based waiting, eliminating flaky tests
tags: async, waitFor, polling, flaky-tests, conditions
---

## Use vi.waitFor for Async Conditions

Arbitrary timeouts (setTimeout with fixed delays) are the #1 cause of flaky tests. They either wait too long (slow tests) or not long enough (flaky tests). Use `vi.waitFor` to poll for conditions instead.

**Incorrect (arbitrary timeout):**

```typescript
import { describe, it, expect } from 'vitest'

describe('DataLoader', () => {
  it('should load data', async () => {
    const loader = new DataLoader()
    loader.start()

    // Arbitrary 500ms - might be too short on slow CI, too long for fast machines
    await new Promise(r => setTimeout(r, 500))

    expect(loader.data).toEqual({ items: [1, 2, 3] })
  })
})
```

**Correct (condition-based waiting):**

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('DataLoader', () => {
  it('should load data', async () => {
    const loader = new DataLoader()
    loader.start()

    // Polls condition until true or timeout
    await vi.waitFor(() => {
      expect(loader.data).toEqual({ items: [1, 2, 3] })
    })
  })
})
```

**With custom options:**

```typescript
await vi.waitFor(
  () => {
    expect(element.textContent).toBe('Loaded')
  },
  {
    timeout: 5000,  // Max wait time
    interval: 100,  // Poll interval
  }
)
```

**Polling a value with expect.poll:**

`expect.poll` retries an assertion against a callback's result. Since Vitest 5 it fails as soon as `timeout` expires; a result that arrives later no longer rescues it. Set `timeout` to cover the slowest legitimate response. The callback receives an `AbortSignal`, so pass it on to cancel work from timed-out attempts:

```typescript
await expect
  .poll(({ signal }) => fetch('/api/jobs/42', { signal }).then((r) => r.json()), {
    timeout: 5000,
    interval: 200,
  })
  .toMatchObject({ status: 'done' })
```

**When NOT to use this pattern:**
- When you have full control over timing (use fake timers instead)
- For synchronous operations

**Benefits:**
- Tests complete as fast as possible
- No arbitrary delays that cause flakiness
- Clear timeout errors when conditions aren't met

Reference: [Vitest vi.waitFor](https://vitest.dev/api/vi.html#vi-waitfor) · [Vitest expect.poll](https://vitest.dev/api/expect#poll)
