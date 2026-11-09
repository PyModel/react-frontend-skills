---
title: Eliminate Network Calls in Unit Tests
impact: MEDIUM
impactDescription: makes tests 10-100× faster
tags: perf, network, mocking, speed
---

## Eliminate Network Calls in Unit Tests

Unit tests should never make real network requests. Network calls are slow, unreliable, and create dependencies on external systems.

**Incorrect (real network calls):**

```typescript
test('fetches user profile', async () => {
  // Real HTTP request - slow, flaky, requires running server
  const response = await fetch('http://localhost:3000/api/users/123')
  const user = await response.json()

  expect(user.name).toBe('Alice')
})

test('sends notification', async () => {
  // Real external API call - costs money, slow, can fail
  const result = await notificationService.send({
    to: 'test@example.com',
    message: 'Hello'
  })

  expect(result.delivered).toBe(true)
})
```

**Correct (MSW for HTTP):**

```typescript
import { expect, test, vi } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { server } from './mocks/server'

test('fetches user profile', async () => {
  const mockUser = { id: '123', name: 'Alice', email: 'alice@test.com' }
  server.use(http.get('*/api/users/123', () => HttpResponse.json(mockUser)))

  const user = await userService.getProfile('123')

  expect(user.name).toBe('Alice') // assert behavior, not that fetch was called
})

test('sends notification', async () => {
  // Inject the collaborator instead of replacing global.fetch
  const send = vi.fn().mockResolvedValue({ delivered: true, messageId: 'm1' })
  const service = new NotificationService({ send })

  const result = await service.send({
    to: 'test@example.com',
    message: 'Hello'
  })

  expect(result.delivered).toBe(true)
  expect(send).toHaveBeenCalledWith({
    to: 'test@example.com',
    message: 'Hello'
  })
})
```

**Mocking strategies:**
- MSW for HTTP interception (see the `msw` skill)
- Vitest `vi.fn()` / `vi.spyOn()`; Jest uses `jest.fn()` / `jest.spyOn()`
- Dependency injection with fake implementations
- Do not replace `global.fetch` by hand: the stub leaks between tests and bypasses the app's request layer

Reference: [MSW - Mock Service Worker](https://mswjs.io/)
