---
title: Clear Mock State Between Tests
impact: MEDIUM
impactDescription: Prevents call count and argument contamination between tests
tags: mock, clearAllMocks, mock-state, test-isolation
---

## Clear Mock State Between Tests

Mocks track call history (how many times called, with what arguments). Vitest defaults `clearMocks` to `true`, so history is cleared before every test. The leak below only happens when a config sets `clearMocks: false`, or for calls recorded outside a test (setup files, module scope, `beforeAll`).

**Incorrect (mock state leaks):**

```typescript
import { describe, it, expect, vi } from 'vitest'

const logger = {
  log: vi.fn(),
}

describe('NotificationService', () => {
  it('should log on success', () => {
    notificationService.send('Hello')
    expect(logger.log).toHaveBeenCalledOnce()
  })

  it('should log on failure', () => {
    notificationService.sendFailing('World')
    // FAILS with clearMocks: false - logger.log has 2 calls
    expect(logger.log).toHaveBeenCalledOnce()
  })
})
```

**Correct (clear mock state):**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const logger = {
  log: vi.fn(),
}

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks() // Clears call history, keeps implementation
  })

  it('should log on success', () => {
    notificationService.send('Hello')
    expect(logger.log).toHaveBeenCalledOnce()
  })

  it('should log on failure', () => {
    notificationService.sendFailing('World')
    // Works - mock state was cleared
    expect(logger.log).toHaveBeenCalledOnce()
  })
})
```

**Mock state methods comparison:**

| Method | Clears Calls | Clears Implementation | Restores Original |
|--------|-------------|----------------------|-------------------|
| `vi.clearAllMocks()` | Yes | No | No |
| `vi.resetAllMocks()` | Yes | Yes | No |
| `vi.restoreAllMocks()` | No | No | Yes (`vi.spyOn` spies only) |

**Configuration option:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    clearMocks: true, // Default; clears call history before every test
  },
})
```

**Benefits:**
- Accurate call count assertions
- Tests are independent
- No mysterious test order dependencies

Reference: [Vitest vi.clearAllMocks](https://vitest.dev/api/vi.html#vi-clearallmocks)
