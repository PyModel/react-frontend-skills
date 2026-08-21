---
title: Use revalidateTag with cacheLife Profiles
impact: CRITICAL
impactDescription: stale-while-revalidate behavior, instant updates
tags: cache, revalidate-tag, cache-life, invalidation
---

## Use revalidateTag with cacheLife Profiles

Next.js 16 deprecates the single-argument `revalidateTag(tag)` form and reports it as a TypeScript error. Pass a cache-life profile such as `'max'` for stale-while-revalidate behavior, or choose `updateTag()` in a Server Action when the current user must immediately read their own write.

**Incorrect (old revalidateTag API):**

```typescript
// app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(id: string, data: FormData) {
  await db.products.update({ where: { id }, data })

  // Deprecated single-argument API; fails current Next.js type checking.
  revalidateTag('products')
}
```

**Correct (revalidateTag with cacheLife):**

```typescript
// app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(id: string, data: FormData) {
  await db.products.update({ where: { id }, data })

  // Recommended: 'max' enables stale-while-revalidate
  revalidateTag('products', 'max')
}

// 'max' (recommended): serve cached data immediately and refresh in the
//   background the next time the tag is visited (stale-while-revalidate)
// Built-in cacheLife profiles: 'max', 'hours', 'days', 'weeks'
// For immediate read-your-writes updates use updateTag(tag) in a Server Action,
//   or revalidateTag(tag, { expire: 0 }) for webhooks needing instant expiry
```

**Tagging cached data:**

```typescript
// lib/data.ts
'use cache'

import { cacheTag } from 'next/cache'

export async function getProducts() {
  cacheTag('products')
  const res = await fetch('https://api.store.com/products')
  return res.json()
}
```

Reference: [Next.js revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
