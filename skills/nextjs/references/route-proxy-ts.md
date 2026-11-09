---
title: Use proxy.ts for Network Boundary Logic
impact: MEDIUM-HIGH
impactDescription: clearer network boundary, Node.js runtime
tags: route, proxy, middleware, network
---

## Use proxy.ts for Network Boundary Logic

Use `proxy.ts` for network-boundary logic (redirects, rewrites, header changes before a route renders). It runs on the Node.js runtime, and its runtime cannot be configured. Export a function named `proxy` (or a default export) and scope it with `config.matcher`.

**Correct (proxy.ts):**

```typescript
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')

  // Full Node.js APIs available (not Edge)
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add headers, rewrite, etc.
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')
  return response
}

export const config = {
  matcher: '/dashboard/:path*'
}
```

Reference: [Next.js proxy file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
