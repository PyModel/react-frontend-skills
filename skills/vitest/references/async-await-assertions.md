---
title: Await Async Assertions
impact: CRITICAL
impactDescription: Prevents false positives where tests pass despite failing assertions
tags: async, promises, assertions, false-positives
---

## Await Async Assertions

Forgetting to await async assertions lets the test body finish before the assertion settles. Vitest 5 fails such a test and points at the unawaited assertion (Vitest 4 auto-awaited it with a warning); other runners such as Jest can let the test pass while the check runs afterwards, hiding real failures. Await it so the failure is reported where it happens.

**Incorrect (missing await):**

```typescript
import { describe, it, expect } from 'vitest'

describe('UserService', () => {
  it('should reject invalid users', () => {
    const service = new UserService()
    // Not awaited: Vitest 5 fails the test; Jest may pass it
    expect(service.validate({ name: '' })).rejects.toThrow('Name required')
  })
})
```

**Correct (awaited assertion):**

```typescript
import { describe, it, expect } from 'vitest'

describe('UserService', () => {
  it('should reject invalid users', async () => {
    const service = new UserService()
    // Test waits for assertion to complete
    await expect(service.validate({ name: '' })).rejects.toThrow('Name required')
  })
})
```

**Benefits:**
- Tests fail when they should fail
- No silent assertion failures
- Accurate test results

Reference: [Vitest Expect API](https://vitest.dev/api/expect.html)
