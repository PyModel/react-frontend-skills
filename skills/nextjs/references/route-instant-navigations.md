---
title: Make Navigations Instant with Stream, Cache, or Block
impact: HIGH
impactDescription: SPA-like instant navigations in a server-driven app
tags: route, navigation, instant, suspense, use-cache, cache-components, instant-insights
---

## Make Navigations Instant with Stream, Cache, or Block

> **Next.js 16.3 (preview, `next@preview`).** Requires `cacheComponents: true` in `next.config.ts`. Both the feature flags (`cacheComponents`, `partialPrefetching`) are planned to become defaults in a future major release.

In a server-driven app, a navigation that `await`s data on the server blocks until the network roundtrip completes: click → nothing → page. Next.js 16.3 makes slow navigations a development error (the **Instant Insights** panel) and gives you three ways to resolve each one:

- **Stream** with `<Suspense>` — the user instantly sees a loading state, then UI streams in.
- **Cache** with `'use cache'` — the user instantly sees previously cached UI reused between requests.
- **Block** with `export const instant = false` — deliberately keep the navigation server-bound (e.g., a blog that never shows a loading shell for posts).

**Incorrect (accidental blocking navigation):**

```typescript
// app/products/[id]/page.tsx
export default async function ProductPage({ params }) {
  const { id } = await params
  const product = await getProduct(id) // No Suspense, no 'use cache'
  return <ProductDetails product={product} />
}
// Click → blank frame until the server roundtrip finishes.
// Instant Insights reports this as a slow navigation in dev.
```

**Correct (stream for instant shell):**

```typescript
// app/products/[id]/page.tsx
import { Suspense } from 'react'

export default async function ProductPage({ params }) {
  const { id } = await params
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails productId={id} />
    </Suspense>
  )
}
// Click → skeleton renders instantly, details stream in.
```

**Correct (cache for instant cached UI):**

```typescript
// app/products/[id]/data.ts
export async function getProduct(id: string) {
  'use cache'
  const product = await db.product.findUnique({ where: { id } })
  return product
}
// Repeat visits render instantly from the cached entry.
```

**Correct (explicit opt-out when the route must block):**

```typescript
// app/blog/[slug]/page.tsx
export const instant = false

export default async function PostPage({ params }) {
  const post = await getPost((await params).slug)
  return <Article post={post} />
}
// Navigations stay server-bound by choice; the dev error goes away.
```

**Catch regressions with the Playwright `instant` helper:**

```typescript
import { expect, test } from '@playwright/test'
import { instant } from '@next/playwright'

test('product title is available immediately', async ({ page }) => {
  await page.goto('/products/shoes')

  // Assert what is visible without waiting for the network
  await instant(page, async () => {
    await page.click('a[href="/products/hats"]')
    await expect(page.locator('h1')).toContainText('Baseball Cap')
    await expect(page.getByText('Checking inventory...')).toBeVisible()
  })

  await expect(page.getByText('12 in stock')).toBeVisible()
})
```

**Notes:**

- Enable with `cacheComponents: true`; combine with `partialPrefetching: true` for the shell prefetching that makes the first click instant (see [route-partial-prefetching](route-partial-prefetching.md)).
- The **Navigation Inspector** in Next.js DevTools pauses a navigation at the shell so you can see what displays instantly versus after the network hop.
- Known preview issues: Instant Insights tooling is unreliable in Safari — use Chrome or Firefox in development. Accessing `params` inside a shell with Partial Prefetching can block without being reported (fixed during the preview cycle).
