---
title: Prefetch Infinite Lists with queryClient.infiniteQuery
impact: MEDIUM
impactDescription: 5.102 deprecated prefetchInfiniteQuery, fetchInfiniteQuery and ensureInfiniteQueryData in favor of one infiniteQuery() method
tags: prefetch, infinite, infiniteQuery, deprecation, pagination
---

## Prefetch Infinite Lists with queryClient.infiniteQuery

TanStack Query 5.102 replaced the imperative infinite-query methods with a single `queryClient.infiniteQuery(options)`. The old methods still work, but they are deprecated and will be removed in the next major:

| Deprecated | Replacement |
|---|---|
| `prefetchInfiniteQuery(o)` | `infiniteQuery(o).catch(noop)` |
| `fetchInfiniteQuery(o)` | `infiniteQuery(o)` |
| `ensureInfiniteQueryData(o)` | `infiniteQuery({ ...o, staleTime: 'static' })` |

The same applies to single queries: `prefetchQuery`, `fetchQuery` and `ensureQueryData` became `queryClient.query()` (see `prefetch-on-hover`).

**Incorrect (deprecated methods, duplicated options):**

```typescript
await queryClient.prefetchInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed(pageParam),
  initialPageParam: null,
})
```

**Correct (shared options, infiniteQuery):**

```typescript
import { infiniteQueryOptions, noop } from '@tanstack/react-query'

export const feedQueryOptions = infiniteQueryOptions({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed(pageParam),
  initialPageParam: null as string | null, // required
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Best-effort prefetch (hover, route loader): never throws
void queryClient.infiniteQuery(feedQueryOptions).catch(noop)

// Preload the first three pages (pages requires getNextPageParam)
await queryClient.infiniteQuery({ ...feedQueryOptions, pages: 3 }).catch(noop)

// Use cached data if present, otherwise fetch (was ensureInfiniteQueryData)
const feed = await queryClient.infiniteQuery({ ...feedQueryOptions, staleTime: 'static' })
```

The component then reads the same cache entry with `useInfiniteQuery(feedQueryOptions)`.

**Notes:**
- `retry` defaults to `false` for imperative calls. Without `.catch(noop)`, a failed fetch rejects.
- `select` changes only the returned value; the cache keeps the raw pages.
- Observer options such as `enabled`, `refetchOnWindowFocus`, `placeholderData`, `throwOnError` and `suspense` are not accepted here.
- 5.102 also removed `experimental_prefetchInRender` and the `promise` property on query results. Code that does `use(query.promise)` must switch to `useSuspenseQuery` (see `suspense-use-suspense-hooks`).

Reference: [QueryClient reference](https://tanstack.com/query/latest/docs/reference/QueryClient) · [query-core 5.102.0 release](https://github.com/TanStack/query/releases/tag/%40tanstack%2Fquery-core%405.102.0)
