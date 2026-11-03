---
title: Guard Static Routes with ensureStatic
impact: MEDIUM-HIGH
impactDescription: fails the build instead of shipping request-time rendering to a static route
tags: route, static, ensure-static, cache-components, partial-prefetching, segment-config
---

## Guard Static Routes with ensureStatic

> **Next.js 16.4+.** Requires `cacheComponents: true`; the build fails otherwise. `'shell'` and `'prefetch'` also need `partialPrefetching: true` (without it they have no effect and Next.js warns).

Cache Components lets one page stream static and dynamic content together. For blogs, marketing pages and stores that should stay static, one dynamic component (a `cookies()` read, an uncached fetch) can silently turn the route into per-request rendering. Export `ensureStatic` from a page or layout to make that a build error.

**Incorrect (a dynamic component sneaks into a page meant to be static):**

```tsx
// app/blog/[slug]/page.tsx
export default function Page() {
  return (
    <>
      <UserAvatar /> {/* reads cookies(): request-time rendering, no error */}
      <Content />
    </>
  )
}
```

**Correct (the route must be fully static):**

```tsx
// app/blog/[slug]/page.tsx
export const ensureStatic = 'navigation'

export async function generateStaticParams() {
  return [{ slug: 'hello-world' }]
}

export default function Page() {
  return <Content /> // adding <UserAvatar /> now fails next dev and next build
}
```

**Allowed values** (`'auto' | 'shell' | 'prefetch' | 'navigation' | false`; each stricter level includes the earlier stages):

| Value | Output that must be static |
| --- | --- |
| `'auto'` (default) | No additional requirement; same as omitting the export |
| `'shell'` | App Shell |
| `'prefetch'` | App Shell and per-link prefetch |
| `'navigation'` | Complete server-rendered route (works with Cache Components alone) |
| `false` | Not a static level; fails the build if another segment sets `'shell'`, `'prefetch'` or `'navigation'` |

**Apply it to a whole app from the root layout:**

```tsx
// app/layout.tsx
export const ensureStatic = 'navigation'
```

A child segment may set a stricter level than its parent but not a weaker one (the build fails), and `false` cannot be mixed with a static level in a parent and child. If one section needs dynamic content, set the level on the other sections' layouts instead of the root. Parallel slots rendered together must agree.

**Notes:**

- With `'navigation'`, a dynamic route must export `generateStaticParams()` returning complete parameter sets.
- `'navigation'` rejects uncached data, `cookies()`, `headers()`, server `searchParams`, and `use cache` scopes with `expire` under 5 minutes, `stale` under 30 seconds or `revalidate: 0`, even inside `<Suspense>`. `await navigation()` and `await prefetch()` are allowed.
- Client Components may load request data in the browser (`use(browser())`, `useParams()`, `useSearchParams()`).
- Cannot be exported from a Client Component. It enforces static output; it does not validate instant UI (that is `instant`).
- Per-subtree alternatives: see `navigation()` and `prefetch()` in [route-partial-prefetching](route-partial-prefetching.md).

Reference: [ensureStatic](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/ensureStatic) · [Next.js 16.4](https://nextjs.org/blog/next-16-4)
