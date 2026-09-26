---
title: Restore Mocks After Each Test
impact: CRITICAL
impactDescription: Prevents mock leakage where mocked behavior persists into unrelated tests
tags: setup, mocks, restoreAllMocks, vi.restoreAllMocks, isolation
---

## Restore Mocks After Each Test

Spies created with `vi.spyOn` keep replacing the real method across tests until they are restored. A spy set up in one test can then break later tests, causing mysterious failures or false positives. Restoring (`vi.restoreAllMocks()` or `restoreMocks: true`) only undoes `vi.spyOn` spies, since Vitest 4. It does not touch `vi.fn()` mocks or automocks. Their call history is already cleared before each test by Vitest 5's default `clearMocks: true`; resetting their implementations needs `mockReset()` or `vi.resetAllMocks()`.

**Incorrect (mocks not restored):**

```typescript
import { describe, it, expect, vi } from 'vitest'
import * as api from './api'

describe('UserService', () => {
  it('should handle API errors', () => {
    vi.spyOn(api, 'fetchUser').mockRejectedValue(new Error('Network error'))

    // Test error handling...
  })

  it('should fetch user data', async () => {
    // FAILS - fetchUser is still mocked from previous test!
    const user = await api.fetchUser(1)
    expect(user.name).toBe('Alice')
  })
})
```

**Correct (mocks restored):**

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as api from './api'

describe('UserService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle API errors', () => {
    vi.spyOn(api, 'fetchUser').mockRejectedValue(new Error('Network error'))
    // Test error handling...
  })

  it('should fetch user data', async () => {
    // Works - mock was restored
    const user = await api.fetchUser(1)
    expect(user.name).toBe('Alice')
  })
})
```

**Configuration option (recommended):**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    restoreMocks: true,  // Restores vi.spyOn spies before each test
  },
})
```

`restoreMocks` is a config option only; there is no `--restoreMocks` CLI flag. It restores spies globally, so it can undo a spy another concurrent test still relies on. In suites that use `test.concurrent`, restore inside each test instead.

**Mock restoration methods:**

```typescript
// Restore original implementations of vi.spyOn spies (keeps call history)
vi.restoreAllMocks()

// Clear call history and reset each mock's implementation
vi.resetAllMocks()

// Clear mock call history only
vi.clearAllMocks()
```

**Benefits:**
- Tests don't affect each other
- Predictable mock behavior
- Easier to reason about test isolation

Reference: [Vitest Mock Functions](https://vitest.dev/api/vi.html#vi-restoreallmocks)
