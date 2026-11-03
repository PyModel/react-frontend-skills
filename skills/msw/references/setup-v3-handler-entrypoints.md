---
title: Import Handlers from the MSW 3 Subpath Entrypoints
impact: CRITICAL
impactDescription: graphql is gone from the root export; the subpaths are the documented 3.x imports
tags: setup, imports, entrypoints, esm, v3, migration
---

## Import Handlers from the MSW 3 Subpath Entrypoints

MSW 3 ships each handler namespace and utility from its own entrypoint. `graphql` is no longer exported from `'msw'`, so a root import of it fails. The root still re-exports `http`, `HttpResponse`, `ws`, `sse`, `delay`, `bypass` and `passthrough` (checked in 3.0.3), but the migration guide documents the subpaths as the 3.x imports, so new code uses them.

**Incorrect (root imports):**

```typescript
// graphql is not exported from 'msw' in 3.x; the rest still resolve but are not the documented imports
import { http, HttpResponse, graphql, ws, sse, delay, bypass, passthrough } from 'msw'
```

**Correct (designated entrypoints):**

```typescript
import { http, HttpResponse } from 'msw/http'
import { graphql } from 'msw/graphql'
import { ws } from 'msw/ws'
import { sse } from 'msw/sse'
import { delay } from 'msw/utils/delay'
import { bypass } from 'msw/utils/bypass'
import { passthrough } from 'msw/utils/passthrough'
import { isCommonAssetRequest } from 'msw/utils/is-common-asset-request'

// These stay where they were
import { setupServer } from 'msw/node'
import { setupWorker } from 'msw/browser'
import { getResponse, type AnyHandler } from 'msw'
```

**Notes:**

- Types follow their namespace: `HttpResponseResolver` comes from `'msw/http'`, GraphQL types from `'msw/graphql'`.
- MSW 3 is ESM-only. A codemod is available: [`@mswjs/v3`](https://app.codemod.com/registry/@mswjs/v3).
- On MSW 2.x: `import { http, HttpResponse, graphql, ws, sse, delay, bypass, passthrough } from 'msw'`; the subpaths do not exist.

Reference: [MSW 2.x → 3.x Migration - Imports](https://mswjs.io/docs/migrations/2.x-to-3.x#imports)
