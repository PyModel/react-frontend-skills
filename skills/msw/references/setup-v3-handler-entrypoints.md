---
title: Import graphql from msw/graphql
impact: MEDIUM
impactDescription: graphql is not exported from the root; a root import fails
tags: setup, imports, entrypoints, esm
---

## Import graphql from msw/graphql

`graphql` is not exported from `'msw'`, so a root import of it fails. Import it from `'msw/graphql'`. `http`, `HttpResponse`, `ws`, `sse`, `delay`, `bypass` and `passthrough` import from `'msw'` as normal.

**Incorrect (graphql from the root):**

```typescript
import { graphql } from 'msw'  // not exported from the root
```

**Correct (graphql from its entrypoint):**

```typescript
import { http, HttpResponse, ws, sse, delay, bypass, passthrough } from 'msw'
import { graphql } from 'msw/graphql'

// Setup APIs
import { setupServer } from 'msw/node'
import { setupWorker } from 'msw/browser'
```

**Notes:**

- GraphQL types come from `'msw/graphql'`.
- MSW is ESM-only; the test runner must be able to load ESM packages.

Reference: [MSW API](https://mswjs.io/docs/api)
