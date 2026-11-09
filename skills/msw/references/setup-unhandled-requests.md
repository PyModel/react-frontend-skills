---
title: Configure Unhandled Request Behavior
impact: CRITICAL
impactDescription: Catches missing handlers immediately; prevents silent test failures
tags: setup, unhandled, error, configuration, onUnhandledFrame
---

## Configure Unhandled Request Behavior

Configure `onUnhandledFrame: 'error'` to fail tests when requests or WebSocket connections lack handlers. This catches missing mocks immediately instead of allowing silent network calls or undefined behavior.

**Incorrect (default silent behavior):**

```typescript
// mocks/node.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Default behavior: warns but doesn't fail
// Unhandled requests may hit real APIs or return undefined
export const server = setupServer(...handlers)
```

```typescript
// Test passes despite missing handler - false positive!
it('submits form', async () => {
  await submitForm({ email: 'test@example.com' })
  // POST /submit has no handler but test doesn't fail
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

**Correct (strict unhandled request handling):**

```typescript
// vitest.setup.ts
import { server } from './mocks/node'

beforeAll(() => {
  server.listen({
    onUnhandledFrame: 'error', // Fail on any unhandled request or WebSocket connection
  })
})

afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Custom handling for specific URLs:**

```typescript
beforeAll(() => {
  server.listen({
    onUnhandledFrame({ frame, defaults }) {
      // frame.protocol is 'http' or 'ws'; narrow before reading frame.data
      if (
        frame.protocol === 'http' &&
        frame.data.request.url.includes('/static/')
      ) {
        return // Perform as-is, no warning (e.g., static assets)
      }
      // Error on all other unhandled requests and connections
      defaults.error()
    },
  })
})
```

- Strategies: `'warn'` (default), `'error'`, `'bypass'`. `defaults` only has `warn()` and `error()`; return without calling either to let the frame through silently.
- A custom callback opts out of MSW's default ignoring of static asset requests; call `isCommonAssetRequest(frame.data.request)` from `'msw/utils/is-common-asset-request'` to keep it.
- WebSocket frames expose the connection under `frame.data.connection`.

**When NOT to use this pattern:**
- Development environments may prefer `'warn'` for less disruptive feedback
- Integration tests that intentionally hit real endpoints

Reference: [MSW listen() - onUnhandledFrame](https://mswjs.io/api/setup-server/listen#onunhandledframe)
