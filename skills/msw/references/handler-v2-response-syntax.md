---
title: Use HttpResponse Syntax, Not v1 res(ctx)
impact: CRITICAL
impactDescription: v1 syntax breaks in v2 and v3; causes complete handler failure
tags: handler, response, v2, v3, HttpResponse, migration
---

## Use HttpResponse Syntax, Not v1 res(ctx)

MSW v2 replaced the composition-based `res(ctx.json())` syntax with native `Response` and `HttpResponse`, and v3 keeps it. Using v1 syntax causes handlers to fail silently.

On MSW 2.x: same handler code, imported as `import { http, HttpResponse, delay } from 'msw'`.

**Incorrect (v1 composition syntax):**

```typescript
// MSW v1 syntax - does not work in v2 or v3
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ name: 'John' }),
      ctx.delay(100)
    )
  }),
]
```

**Correct (HttpResponse syntax, v3 imports):**

```typescript
// MSW v3 syntax
import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'

export const handlers = [
  http.get('/api/user', async () => {
    await delay(100)
    return HttpResponse.json(
      { name: 'John' },
      { status: 200 }
    )
  }),
]
```

**Common response patterns:**

```typescript
import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'

export const handlers = [
  // JSON response
  http.get('/api/user', () => {
    return HttpResponse.json({ name: 'John' })
  }),

  // Text response
  http.get('/api/text', () => {
    return HttpResponse.text('Hello, World!')
  }),

  // XML response
  http.get('/api/xml', () => {
    return HttpResponse.xml('<user><name>John</name></user>')
  }),

  // Empty response with status
  http.delete('/api/user/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Custom headers
  http.get('/api/data', () => {
    return HttpResponse.json(
      { data: 'value' },
      {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      }
    )
  }),

  // Network error
  http.get('/api/error', () => {
    return HttpResponse.error()
  }),
]
```

**When NOT to use this pattern:**
- Projects still on MSW v1 should use the v1 syntax until migration

Reference: [MSW v2 Migration Guide](https://mswjs.io/docs/migrations/1.x-to-2.x/), [MSW v3 Migration Guide](https://mswjs.io/docs/migrations/2.x-to-3.x)
