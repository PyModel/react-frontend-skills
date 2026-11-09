---
title: Use Absolute URLs in Handlers
impact: CRITICAL
impactDescription: prevents unhandled requests in Node.js tests, where relative paths do not resolve to an origin
tags: handler, url, absolute, node, matching
---

## Use Absolute URLs in Handlers

In a pure Node.js environment there is no `location`, so MSW preserves a relative handler path as-is and it does not match an absolute request URL. Use an absolute URL to pin an origin, or `*/path` to match any origin. Relative paths work in the browser and in jsdom/happy-dom because they resolve against `location.href`, but not under `@vitest-environment node` or a plain Node script.

**Incorrect (relative handler in a Node test):**

```typescript
// mocks/handlers.ts
export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({ name: 'John' })
  }),
]

// Test makes an absolute request
await fetch('http://localhost:3000/api/user')
// No location in Node: the handler does not match, and the request is unhandled
```

**Correct (pin the origin):**

```typescript
export const handlers = [
  http.get('http://localhost:3000/api/user', () => {
    return HttpResponse.json({ name: 'John' })
  }),
]
```

**Correct (match any origin):**

```typescript
export const handlers = [
  http.get('*/api/user', () => {
    return HttpResponse.json({ name: 'John' })
  }),
]
```

**Browser and jsdom:** a relative handler is resolved against `location.href`, so `http.get('/api/user', ...)` works there. Do not copy that form into a Node-environment test.

**Environment variable pitfall:**

```typescript
// AVOID: the variable is undefined in tests
const API_URL = process.env.API_URL

http.get(`${API_URL}/user`, () => { /* ... */ })
// Results in http.get('undefined/user', ...), which never matches
```

Reference: [MSW Request Matching](https://mswjs.io/docs/http/intercepting-requests)
