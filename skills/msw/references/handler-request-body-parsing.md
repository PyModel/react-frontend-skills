---
title: Explicitly Parse Request Bodies
impact: CRITICAL
impactDescription: Bodies are not auto-parsed; reading request.body yields a stream, not data
tags: handler, request, body, parsing, json
---

## Explicitly Parse Request Bodies

MSW does not automatically parse request bodies based on Content-Type. You must explicitly call `.json()`, `.text()`, `.formData()`, or `.arrayBuffer()` on the request object.

**Incorrect (assuming auto-parsed body):**

```typescript
// request.body is a ReadableStream, not parsed data
http.post('/api/user', ({ request }) => {
  const body = request.body
  return HttpResponse.json({ id: '1', ...body })
})
```

**Correct (explicit body parsing):**

```typescript
import { http, HttpResponse } from 'msw/http'

export const handlers = [
  // JSON body
  http.post('/api/user', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '1', ...body }, { status: 201 })
  }),

  // Text body
  http.post('/api/text', async ({ request }) => {
    const text = await request.text()
    return HttpResponse.text(`Received: ${text}`)
  }),

  // Form data
  http.post('/api/upload', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file')
    const name = file instanceof File ? file.name : null
    return HttpResponse.json({ filename: name })
  }),

  // ArrayBuffer for binary
  http.post('/api/binary', async ({ request }) => {
    const buffer = await request.arrayBuffer()
    return HttpResponse.json({ bytes: buffer.byteLength })
  }),
]
```

**Typed body parsing:**

```typescript
interface CreateUserRequest {
  name: string
  email: string
}

http.post('/api/user', async ({ request }) => {
  const body = await request.json() as CreateUserRequest
  return HttpResponse.json({
    id: crypto.randomUUID(),
    name: body.name,
    email: body.email,
  })
})
```

**When NOT to use this pattern:**
- GET requests typically don't have bodies and don't need parsing

Reference: [MSW Request Handler - resolver](https://mswjs.io/docs/api/http)
