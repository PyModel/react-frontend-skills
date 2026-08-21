---
title: Match Route Configuration to the Active Cache Model
impact: MEDIUM-HIGH
impactDescription: avoids mixing incompatible Cache Components and legacy segment options
tags: cache, segment-config, dynamic, revalidate, cache-components
---

## Match Route Configuration to the Active Cache Model

Next.js 16 supports two caching models. First determine whether `cacheComponents: true` is enabled.

### Cache Components enabled

Use `'use cache'`, `cacheLife()`, `cacheTag()`, `<Suspense>`, and request-time APIs. Exporting `dynamic`, `revalidate`, `fetchCache`, `dynamicParams`, `runtime`, or `experimental_ppr` from a page, layout, or route is a build error when `cacheComponents` is enabled. Remove them rather than layering them onto the new model.

**Incorrect (legacy segment exports under Cache Components):**

```typescript
// app/about/page.tsx
export const dynamic = 'force-static'
export const revalidate = 86400
```

**Correct (Cache Components model):**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = { cacheComponents: true }
export default nextConfig
```

```typescript
// app/about/page.tsx
import { cacheLife } from 'next/cache'

export default async function AboutPage() {
  'use cache'
  cacheLife('days')

  const team = await getTeam()
  return <TeamSection team={team} />
}
```

### Cache Components disabled (previous model)

Route segment configuration remains available. Use it only when the whole segment genuinely shares that rendering policy; prefer per-fetch controls for mixed data.

```typescript
export const dynamic = 'force-static'
export const revalidate = 86400

export default async function AboutPage() {
  const team = await getTeam()
  return <TeamSection team={team} />
}
```

For request-specific routes in the previous model, use `dynamic = 'force-dynamic'` or explicit uncached fetches. `generateStaticParams()` controls which dynamic route parameters are generated; it is not itself a cache invalidation API.

Reference: [Next.js route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
