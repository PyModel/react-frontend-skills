---
title: Add Delays Only for Timing Behavior Under Test
impact: HIGH
impactDescription: exercises loading, timeout, cancellation, and race behavior without slowing every test
tags: response, delay, async, loading, timing
---

## Add Delays Only for Timing Behavior Under Test

Keep baseline handlers deterministic and fast. Add `delay()` in the specific test or development scenario whose contract includes a loading state, timeout, cancellation, race, or hung request. A random global delay makes tests slower and less reproducible.

**Correct (deterministic baseline handlers):**

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/user', () =>
    HttpResponse.json({ name: 'John' })
  ),
]
```

Override timing in the test that needs it:

```typescript
import { delay, http, HttpResponse } from 'msw'

it('shows loading while the request is pending', async () => {
  server.use(
    http.get('/api/user', async () => {
      await delay(100)
      return HttpResponse.json({ name: 'John' })
    })
  )

  render(<UserProfile />)

  expect(screen.getByText('Loading…')).toBeInTheDocument()
  expect(await screen.findByText('John')).toBeInTheDocument()
})
```

**Delay modes:**

```typescript
// Explicit, reproducible delay - use this when a test needs visible pending time
await delay(200)

// 'real' / bare delay(): randomized 100-400ms in the browser,
// but a fixed 5ms under Node, so it will not make a loading state observable there
await delay('real')

// Infinite delay - simulates a hung request. Under Node this is setTimeout's
// max int with .unref(), so it will not keep the process alive
await delay('infinite')
```

Use `delay('infinite')` only when the test controls cancellation or timeout.

**Incorrect (a global delay applied to every handler):**

```typescript
import { http, delay } from 'msw'

export const handlers = [
  // Slows every test in the suite to buy timing realism no assertion depends on
  http.all('*', async () => {
    await delay(100)
    // No return = continue to the next matching handler
  }),

  http.get('/api/user', () => HttpResponse.json({ name: 'John' })),
]
```

Do not use arbitrary delay values to wait in the test itself:

```typescript
render(<UserProfile />)
await new Promise((resolve) => setTimeout(resolve, 200))
expect(screen.getByText('John')).toBeInTheDocument()
```

Assert observable state with the testing framework's async utilities instead:

```typescript
render(<UserProfile />)
expect(await screen.findByText('John')).toBeInTheDocument()
```

Reference: [MSW delay API](https://mswjs.io/docs/api/delay)
