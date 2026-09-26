---
title: Understand vi.mock Hoisting Behavior
impact: HIGH
impactDescription: Prevents "module not mocked" errors and unexpected real implementations
tags: mock, vi.mock, hoisting, module-mocking, imports
---

## Understand vi.mock Hoisting Behavior

`vi.mock()` calls are hoisted to the top of the file, executing before any imports. This means you can't use variables defined outside the mock factory, and the mock applies even to imports that appear earlier in the file.

**Incorrect (using external variable in mock):**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { fetchUser } from './api'

const mockResponse = { id: 1, name: 'Alice' }

// ERROR: mockResponse is not defined when this runs
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue(mockResponse),
}))

describe('UserService', () => {
  it('should return user', async () => {
    const user = await fetchUser(1)
    expect(user).toEqual(mockResponse)
  })
})
```

**Correct (inline mock value):**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { fetchUser } from './api'

vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
}))

describe('UserService', () => {
  it('should return user', async () => {
    const user = await fetchUser(1)
    expect(user).toEqual({ id: 1, name: 'Alice' })
  })
})
```

**Alternative (vi.hoisted for shared variables):**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { fetchUser } from './api'

// vi.hoisted runs at hoisting time, before imports
const { mockFetchUser } = vi.hoisted(() => ({
  mockFetchUser: vi.fn(),
}))

vi.mock('./api', () => ({
  fetchUser: mockFetchUser,
}))

describe('UserService', () => {
  it('should return user', async () => {
    mockFetchUser.mockResolvedValue({ id: 1, name: 'Alice' })
    const user = await fetchUser(1)
    expect(user).toEqual({ id: 1, name: 'Alice' })
  })
})
```

**Top level only (Vitest 5):**

`vi.mock`, `vi.unmock` and `vi.hoisted` must sit at module top level. A call inside `describe`, `it` or a hook fails the whole file at transform time with "was defined outside of the module's top level scope". Vitest 4 only warned. To mock a module for a single test, use `vi.doMock`, which is not hoisted, then import the module dynamically:

```typescript
import { it, expect, vi } from 'vitest'

it('uses the fallback user', async () => {
  vi.doMock('./api', () => ({ fetchUser: vi.fn().mockResolvedValue(null) }))
  const { loadProfile } = await import('./profile') // imported after doMock
  expect(await loadProfile(1)).toEqual({ name: 'Guest' })
  vi.doUnmock('./api')
})
```

**Benefits:**
- Mocks work as expected
- Variables are available at mock definition time
- Clear control over mock behavior per test

Reference: [Vitest vi.mock](https://vitest.dev/api/vi.html#vi-mock) · [Vitest 5 migration: hoisted calls at top level](https://vitest.dev/guide/migration#hoisted-mocking-calls-must-be-at-the-top-level)
