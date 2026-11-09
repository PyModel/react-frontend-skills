---
title: Import Handlers from the Subpath Entrypoints
impact: CRITICAL
impactDescription: graphql is not exported from the root; the subpaths are the documented imports
tags: setup, imports, entrypoints, esm
---

## Import Handlers from the Subpath Entrypoints

MSW ships each handler namespace and utility from its own entrypoint. `graphql` is not exported from `'msw'`, so a root import of it fails. The root still re-exports `http`, `HttpResponse`, `ws`, `sse`, `delay`, `bypass` and `passthrough`, but the subpaths are the documented imports, so use them.

**Incorrect (root imports):**

```typescript
// graphql is not exported from 'msw'; the rest resolve but are not the documented imports
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

// Setup and low-level APIs
import { setupServer } from 'msw/node'
import { setupWorker } from 'msw/browser'
import { getResponse, type AnyHandler } from 'msw'
```

**Notes:**

- Types follow their namespace: `HttpResponseResolver` comes from `'msw/http'`, GraphQL types from `'msw/graphql'`.
- MSW is ESM-only; the test runner must be able to load ESM packages.

Reference: [MSW API](https://mswjs.io/docs/api)
