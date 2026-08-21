---
title: Use proxy.ts for Network Boundary Logic
impact: MEDIUM-HIGH
impactDescription: clearer network boundary, Node.js runtime
tags: route, proxy, middleware, network
---

## Use proxy.ts for Network Boundary Logic

Next.js 16 deprecates the `middleware.ts` convention in favor of `proxy.ts` for network-boundary logic. `proxy.ts` uses the Node.js runtime and its runtime cannot be configured. If an existing boundary requires the Edge runtime, keep `middleware.ts` until the installed Next.js version provides a documented migration path.

**Incorrect (old middleware.ts pattern):**

```typescript
// middleware.ts (deprecated in Next.js 16)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: '/dashboard/:path*'
}
```

**Correct (proxy.ts in Next.js 16):**

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

**Migration:**
1. Rename `middleware.ts` → `proxy.ts`
2. Rename exported function `middleware` → `proxy`
3. Remove Edge-only assumptions and verify Node.js runtime behavior; otherwise retain `middleware.ts` for the Edge requirement

Reference: [Next.js proxy file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
