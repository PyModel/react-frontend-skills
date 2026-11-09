---
title: Use Partial Prefetching for Reusable Route Shells
impact: HIGH
impactDescription: one prefetch per route instead of per link, instant first click
tags: route, prefetching, partial-prefetching, shell, link, navigation
---

## Use Partial Prefetching for Reusable Route Shells

> **Next.js 16.3+ (stable in 16.4).** Requires `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`. As of 16.4 Partial Prefetching is part of the Cache Components model, and both flags become defaults in Next.js 17. Leaving `partialPrefetching` unset while `cacheComponents` is on logs a warning.

Prefetching every link in the viewport produces a flurry of requests on scroll, even when many links point at the same route. Partial Prefetching avoids this: **prefetch one reusable loading shell per route**, fetched once and cached on the client for the session.

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

**Defer expensive work out of the shell or the prefetch (16.4):**

Two functions from `next/cache` mark where a subtree stops being part of an earlier navigation stage. Both take no arguments, return `Promise<void>`, require `cacheComponents`, and must be called outside any `'use cache'` scope and outside Client Components. Wrap the awaiting component in `<Suspense>` so a fallback renders in the earlier stage.

```tsx
import { Suspense } from 'react'
import { navigation, prefetch } from 'next/cache'

async function Thread({ id }: { id: string }) {
  await navigation() // excluded from the App Shell AND per-link prefetches
  return <ThreadList items={await getThread(id)} />
}

async function Recommendations() {
  await prefetch() // excluded from the App Shell; may load in a per-link prefetch
  return <List items={await getRecommendations()} />
}
```

- `await navigation()`: content renders only when the user actually navigates. Use it so `<Link prefetch={true}>` does not load an expensive tail (for example a whole message thread) for every visible link.
- `await prefetch()`: content stays out of the shared App Shell but can load in a per-link `prefetch={true}` or on navigation.
- Unlike `connection()`, neither marks the subtree request-dependent, so work below them can still use `'use cache'`. Put the directive on a function called below the await.
- To enforce a stage across a whole route instead of per subtree, see [route-ensure-static](route-ensure-static.md).

**Notes:**

- Inspect what a shell contains with the **Navigation Inspector** in Next.js DevTools — it pauses each navigation at the shell so you can see what renders instantly versus after the network hop.
- Actual prefetching happens only in production builds; in development the Inspector simulates it.
- Because shells are reused across links, they are the foundation for upcoming offline navigation support.
- Pair with [route-instant-navigations](route-instant-navigations.md) (Stream / Cache / Block) so each route actually has an instant shell to prefetch.
