---
title: Use 'use cache' with Cache Components
impact: CRITICAL
impactDescription: opts stable work into the Next.js 16 Cache Components model
tags: cache, use-cache, directive, data-fetching, cache-components
---

## Use 'use cache' with Cache Components

The `'use cache'` directive is part of Next.js 16 Cache Components. Enable the model with top-level `cacheComponents: true`, then place the directive at file, component, or function scope for work whose inputs and outputs are serializable and safe to reuse.

**Incorrect (reading request-time data inside a cached scope):**

```typescript
import { cookies } from 'next/headers'

export async function getDashboard() {
  'use cache'
  const userId = (await cookies()).get('userId')?.value
  return getDashboardForUser(userId)
}
```

Request-time APIs cannot be called inside a cached scope, and caching personalized output under shared arguments can leak data.

**Correct (enable Cache Components and cache stable inputs):**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = { cacheComponents: true }
export default nextConfig
```

```typescript
// lib/data.ts
import { cacheLife, cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const response = await fetch('https://api.store.com/products')
  if (!response.ok) throw new Error('Failed to load products')
  return response.json()
}
```

Without `'use cache'`, runtime fetches remain fresh by default. With it, the cached function follows its cache-life profile and can be invalidated through its tags; it is not necessarily cached forever.

Do not read request-time values such as `cookies()`, `headers()`, or `searchParams` inside a cached scope. Read them outside and pass only the minimal serializable value as an argument. Do not cache personalized data under shared arguments.

If `cacheComponents` is not enabled, follow the previous caching model (`fetch` cache options and, where needed, `unstable_cache`) rather than copying `'use cache'` into the app. Enabling Cache Components is a model change, not a rename-only migration.

Reference: [Next.js Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
