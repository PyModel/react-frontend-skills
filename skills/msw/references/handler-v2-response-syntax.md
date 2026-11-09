---
title: Return an HttpResponse from Every Resolver
impact: CRITICAL
impactDescription: A resolver that returns nothing falls through to the next handler; the mock silently does not apply
tags: handler, response, HttpResponse, resolver
---

## Return an HttpResponse from Every Resolver

A resolver answers a request by returning a `Response`; `HttpResponse` is the `Response` subclass with `json()`, `text()`, `xml()` and `error()` helpers. A resolver that returns nothing (a missing `return`, a forgotten branch) tells MSW the handler did not apply, so the request falls through to the next handler or goes unhandled.

**Incorrect (no return, request falls through):**

```typescript
import { http, HttpResponse } from 'msw/http'

export const handlers = [
  http.get('/api/user', () => {
    // Builds a response but never returns it
    HttpResponse.json({ name: 'John' })
  }),
]
```

**Correct (return the response):**

```typescript
import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'

export const handlers = [
  http.get('/api/user', async () => {
    await delay(100)
    return HttpResponse.json({ name: 'John' }, { status: 200 })
  }),

  http.delete('/api/user/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/error', () => {
    return HttpResponse.error()
  }),
]
```

Return `undefined` on purpose only to skip a handler conditionally and let a later one answer. Status, headers and body variants are covered in [response-http-response-helpers](response-http-response-helpers.md) and [response-custom-headers](response-custom-headers.md).

**When NOT to use this pattern:**
- Intentional fall-through: return nothing when a later handler should answer

Reference: [MSW HttpResponse](https://mswjs.io/docs/api/http-response)
