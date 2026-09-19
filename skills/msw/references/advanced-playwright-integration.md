---
title: Use defineNetworkFixture from @msw/playwright
impact: MEDIUM
impactDescription: controls MSW network from Playwright tests without cross-process worker hacks
tags: msw, playwright, e2e, network, fixture
---

## Use defineNetworkFixture from @msw/playwright

The official [`@msw/playwright`](https://github.com/mswjs/msw/tree/master/packages/playwright) binding lets Playwright tests use the familiar `setupWorker()` API (`use`, `resetHandlers`) directly from the Node.js test process. Without it, overriding handlers requires clunky `page.evaluate(() => window.msw.worker.use(...))` bridges because the worker lives in the browser process.

**Incorrect (cross-process worker references):**

```typescript
test('shows dashboard', async ({ page }) => {
  // Requires exposing msw on window and serializing overrides
  // across the test<->browser process boundary
  await page.evaluate(() => {
    const { worker, http } = window.msw
    worker.use(http.get('/user', () => new Response('{}')))
  })
  await page.goto('/dashboard')
})
```

**Correct (network fixture in the setup file):**

```typescript
// playwright.setup.ts
import { test as testBase } from '@playwright/test'
import { type AnyHandler } from 'msw'
import { defineNetworkFixture, type NetworkFixture } from '@msw/playwright'
import { handlers } from '../mocks/handlers.js'

interface Fixtures {
  handlers: Array<AnyHandler>
  network: NetworkFixture
}

export const test = testBase.extend<Fixtures>({
  // Initial list of the network handlers
  handlers: [handlers, { option: true }],

  network: [
    async ({ context, handlers }, use) => {
      const network = defineNetworkFixture({ context, handlers })
      await network.enable()
      await use(network)
      await network.disable()
    },
    { auto: true },
  ],
})
```

**Correct (override handlers from the test itself):**

```typescript
import { http, HttpResponse } from 'msw'
import { test } from './playwright.setup.js'

test('displays the user dashboard', async ({ network, page }) => {
  network.use(
    http.get('/user', () =>
      HttpResponse.json({ id: 'abc-123', firstName: 'John' }),
    ),
  )

  await page.goto('/dashboard')
})
```

**Notes:**

- Install with `npm i msw @msw/playwright`; no worker script initialization is needed — the package provisions interception through Playwright's `page.route()` until cross-process interception ships.
- `page.route()` limitations apply (e.g., no request bodies for some redirects); treat the transport as an implementation detail.
- WebSocket links via `ws.link()` work, but relative WebSocket URLs resolve against the most recently created page in the context.
- For Vitest browser mode, do not use this package — use the plain browser integration with a test-context fixture instead (see [advanced-vitest-browser](advanced-vitest-browser.md)).
