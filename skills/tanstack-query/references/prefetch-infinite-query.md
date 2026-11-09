---
title: Prefetch Infinite Lists with queryClient.infiniteQuery
impact: MEDIUM
impactDescription: one infiniteQuery() method covers fetching, best-effort prefetching and cache-first reads, sharing options with useInfiniteQuery
tags: prefetch, infinite, infiniteQuery, pagination
---

## Prefetch Infinite Lists with queryClient.infiniteQuery

`queryClient.infiniteQuery(options)` fetches an infinite query imperatively and resolves with `InfiniteData`. One method covers three cases:

| Goal | Call |
|---|---|
| Fetch and await | `infiniteQuery(o)` |
| Best-effort prefetch (never throws) | `infiniteQuery(o).catch(noop)` |
| Use cached data if present, otherwise fetch | `infiniteQuery({ ...o, staleTime: 'static' })` |

Single queries work the same way with `queryClient.query()` (see `prefetch-on-hover`).

**Incorrect (options duplicated between loader and component):**

```typescript
await queryClient.infiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed(pageParam),
  initialPageParam: null,
})

// elsewhere: a second copy that can drift from the first
useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed(pageParam),
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
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

// Use cached data if present, otherwise fetch
const feed = await queryClient.infiniteQuery({ ...feedQueryOptions, staleTime: 'static' })
```

The component then reads the same cache entry with `useInfiniteQuery(feedQueryOptions)`.

**Notes:**
- `retry` defaults to `false` for imperative calls. Without `.catch(noop)`, a failed fetch rejects.
- `select` changes only the returned value; the cache keeps the raw pages.
- Observer options such as `enabled`, `refetchOnWindowFocus`, `placeholderData`, `throwOnError` and `suspense` are not accepted here.
- To suspend a component on a query, use `useSuspenseQuery` (see `suspense-use-suspense-hooks`), not `use(query.promise)`.

Reference: [QueryClient reference](https://tanstack.com/query/latest/docs/reference/QueryClient)
