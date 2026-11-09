---
title: Serve the Worker with the msw/vite Plugin
impact: HIGH
impactDescription: removes the copied worker script and keeps mocking out of production builds
tags: setup, vite, worker, plugin, virtual-msw
---

## Serve the Worker with the msw/vite Plugin

In a Vite app, the `msw/vite` plugin serves `mockServiceWorker.js` from the installed package during development, so there is no copy in `public/` to commit or keep in sync. It also exposes a preconfigured `network` through the `virtual:msw` module that works in the browser and in SSR code, and does nothing in production builds.

**Incorrect (copied worker plus hand-wired setupWorker in a Vite app):**

```typescript
// public/mockServiceWorker.js copied by `msw init` and committed,
// drifting whenever msw is upgraded
import { setupWorker } from 'msw/browser'
import { handlers } from './mocks/handlers'

await setupWorker(...handlers).start()
```

**Correct (plugin + virtual:msw):**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { msw } from 'msw/vite'

export default defineConfig({
  plugins: [msw()],
})
```

```typescript
// src/main.ts - enable mocking before the app makes requests
if (import.meta.env.DEV) {
  const { network } = await import('virtual:msw')
  const { handlers } = await import('./mocks/handlers')

  network.configure({ handlers })
  await network.enable()
}

await import('./app')
```

```typescript
// src/vite-env.d.ts - only if tsconfig does not include vite.config.ts
/// <reference types="vite/client" />
/// <reference types="msw/vite/client" />
```

**Keep your own setupWorker (`worker-only` mode):**

```typescript
// Plugin only serves the worker; virtual:msw is disabled
export default defineConfig({
  plugins: [msw({ mode: 'worker-only' })],
})
```

**Notes:**

- After adopting the plugin, delete `public/mockServiceWorker.js`.
- On the server, `virtual:msw` resolves to the Node.js defaults (same as `setupServer()`).
- Mocking in a production deploy (e.g. a demo) still needs `msw init` and an explicit setup.
- In `worker-only` mode with a custom Vite `base`, pass `serviceWorker.url` to `worker.start()`.

Reference: [MSW Vite integration](https://mswjs.io/guides/integrations/vite)
