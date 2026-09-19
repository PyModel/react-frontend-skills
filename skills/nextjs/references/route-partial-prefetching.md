---
title: Use Partial Prefetching for Reusable Route Shells
impact: HIGH
impactDescription: one prefetch per route instead of per link, instant first click
tags: route, prefetching, partial-prefetching, shell, link, navigation
---

## Use Partial Prefetching for Reusable Route Shells

> **Next.js 16.3 (preview, `next@preview`).** Requires `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`. Planned to become the default behavior in a future major release.

Before 16.2, Next.js sent a prefetch request for **every link** in the viewport — even many links to the same route, producing a flurry of requests on scroll. 16.3 replaces this with a single-page-app trick: **prefetch one reusable loading shell per route**, fetched once and cached on the client for the session.

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
}

export default nextConfig
```

**Incorrect (relying on per-link prefetch for responsiveness):**

```typescript
// A sidebar with twenty chat links fires a prefetch per link,
// most of them for the same /chat/[id] route
export function Sidebar({ chats }) {
  return (
    <nav>
      {chats.map((chat) => (
        <Link key={chat.id} href={`/chat/${chat.id}`}>
          {chat.name}
        </Link>
      ))}
    </nav>
  )
}
// Wasteful: the same route shell is fetched once per link
```

**Correct (let the shell be prefetched once per route):**

```typescript
// With partialPrefetching enabled, Next.js prefetches a single
// reusable shell for /chat/[id], plus one per other distinct route
export function Sidebar({ chats }) {
  return (
    <nav>
      {chats.map((chat) => (
        <Link key={chat.id} href={`/chat/${chat.id}`}>
          {chat.name}
        </Link>
      ))}
    </nav>
  )
}
// One request for the route, cached across all twenty links
```

**Prefetch more than the shell for specific links:**

```tsx
// Opt a single link into deeper prefetching so the chat header
// "pops in" instantly instead of waiting for the network
<Link href={`/chat/${chat.id}`} prefetch={true}>
  {chat.name}
</Link>
```

With `<Link prefetch={true}>`, Next.js still does not render the entire route. It renders down to content that is:

- available synchronously,
- known from the URL (`params`, `searchParams`), or
- marked with `'use cache'`.

This removes the all-or-nothing choice: the instant shell is the baseline, and `<Link prefetch={true}>` plus `'use cache'` adds per-link depth only where it pays off.

**Notes:**

- Inspect what a shell contains with the **Navigation Inspector** in Next.js DevTools — it pauses each navigation at the shell so you can see what renders instantly versus after the network hop.
- Actual prefetching happens only in production builds; in development the Inspector simulates it.
- Because shells are reused across links, they are the foundation for upcoming offline navigation support.
- Pair with [route-instant-navigations](route-instant-navigations.md) (Stream / Cache / Block) so each route actually has an instant shell to prefetch.
