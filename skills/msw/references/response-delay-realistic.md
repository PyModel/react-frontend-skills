---
title: Add Delays Only for Timing Behavior Under Test
impact: HIGH
impactDescription: exercises loading, timeout, cancellation, and race behavior without slowing every test
tags: response, delay, async, loading, timing
---

## Add Delays Only for Timing Behavior Under Test

Keep baseline handlers deterministic and fast. Add `delay()` in the specific test or development scenario whose contract includes a loading state, timeout, cancellation, race, or hung request. A random global delay makes tests slower and less reproducible.

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

Use `delay('infinite')` only when the test controls cancellation or timeout and cannot hang indefinitely. Avoid `delay('real')` in automated tests because randomized timing weakens reproducibility; it can be useful in opt-in development scenarios.

Do not use arbitrary delay values to wait in the test itself. Assert observable state with the testing framework's async utilities.

Reference: [MSW delay API](https://mswjs.io/docs/api/delay)
