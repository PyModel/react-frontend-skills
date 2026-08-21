---
title: Configure Fetch Cache Options Explicitly
impact: HIGH
impactDescription: makes runtime freshness and revalidation behavior deliberate
tags: cache, fetch, revalidate, data-fetching
---

## Configure Fetch Cache Options Explicitly

In Next.js 15 and 16, a server `fetch()` without an explicit cache policy is not cached at runtime. Build-time prerendering may still reuse it during the build. State the intended policy instead of relying on older defaults.

**Incorrect (assuming an implicit runtime cache):**

```typescript
export async function getProducts() {
  // This is fresh at runtime in Next.js 15 and 16; it is not an implicit
  // persistent cache entry.
  return fetch('https://api.example.com/products')
}
```

**Correct (policies match each data contract):**

```typescript
export default async function Page() {
  const config = await fetch('https://api.example.com/config', {
    cache: 'force-cache',
  })

  const user = await fetch(`https://api.example.com/users/${userId}`, {
    cache: 'no-store',
  })

  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 300 },
  })

  const posts = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] },
  })
}
```

Choose from the data contract:

- Request-specific, authorization-dependent, or real-time data: `cache: 'no-store'`.
- Reusable immutable data: `cache: 'force-cache'`.
- Reusable data with a bounded freshness window: `next: { revalidate: seconds }`.
- Reusable data requiring on-demand invalidation: attach `next.tags` and use the matching invalidation API.

Do not cache personalized responses under a key shared by users. Also distinguish the persistent Data Cache from request memoization: identical GET fetches can be deduplicated during one server render without becoming cross-request cached data.

Reference: [Next.js fetch API](https://nextjs.org/docs/app/api-reference/functions/fetch)
