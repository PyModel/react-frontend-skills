---
title: Destructure Resolver Arguments Correctly
impact: CRITICAL
impactDescription: Wrong destructuring pattern causes undefined values; silent failures
tags: handler, resolver, params, cookies, request, destructuring
---

## Destructure Resolver Arguments Correctly

MSW passes a single object argument to resolvers containing `request`, `params`, `cookies`, and other properties. Destructure from this object instead of using multiple arguments.

**Incorrect (query string is not on the info object):**

```typescript
import { http, HttpResponse } from 'msw/http'

// The info object has request, params and cookies; there is no `query` property
http.get('/api/search', ({ query }) => {
  return HttpResponse.json({ q: query.q })  // query is undefined; type error and runtime TypeError
})
```

Search params live on the request URL: `new URL(request.url).searchParams`.

**Correct (destructure the single info object):**

```typescript
import { http, HttpResponse } from 'msw/http'

export const handlers = [
  http.get('/api/user/:id', ({ request, params, cookies }) => {
    return HttpResponse.json({
      id: params.id,
      sessionId: cookies.sessionId,
      userAgent: request.headers.get('User-Agent'),
    })
  }),
]
```

**Available resolver properties:**

```typescript
http.post('/api/data', async (info) => {
  // Full request object
  const { request } = info

  // URL path parameters
  const { params } = info  // { id: '123' } for /api/data/:id

  // Parsed cookies from Cookie header
  const { cookies } = info  // { session: 'abc', token: 'xyz' }

  // Request URL as string (not URL object)
  const url = new URL(request.url)

  // Request method
  const method = request.method

  // Request headers
  const authHeader = request.headers.get('Authorization')

  // Request body (must await)
  const body = await request.json()

  return HttpResponse.json({ success: true })
})
```

**Type-safe params:**

```typescript
// Define params type for better type safety
type UserParams = {
  id: string
  orgId: string
}

http.get<UserParams>('/api/org/:orgId/user/:id', ({ params }) => {
  // params.id and params.orgId are typed as string
  return HttpResponse.json({ userId: params.id, orgId: params.orgId })
})
```

**When NOT to use this pattern:**
- This is the only resolver signature; no alternatives

Reference: [MSW Request Handler - resolver](https://mswjs.io/docs/api/http)
