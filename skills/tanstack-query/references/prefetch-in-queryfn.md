---
title: Start Follow-Up Prefetches When Their Keys Become Known
impact: HIGH
impactDescription: parallelizes dependent data fetching
tags: prefetch, queryFn, parallel, dependent
---

## Start Follow-Up Prefetches When Their Keys Become Known

A truly dependent query cannot start before its prerequisite returns. If the first response reveals follow-up keys and those resources are very likely to render, start best-effort prefetches immediately after that response rather than waiting for child components to mount. Keep the primary query result independent from prefetch failure.

**Incorrect (sequential dependent fetches):**

```typescript
function Feed() {
  const { data: feed } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  // Graph queries only start AFTER feed renders
  return (
    <div>
      {feed?.map(item =>
        item.type === 'GRAPH'
          ? <GraphWidget id={item.id} key={item.id} />
          : <TextWidget item={item} key={item.id} />
      )}
    </div>
  )
}

function GraphWidget({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ['graph', id],
    queryFn: () => getGraphData(id),
  })
  // Started after feed loaded - waterfall!
}
```

**Correct (prefetch in queryFn):**

```typescript
function Feed() {
  const queryClient = useQueryClient()

  const { data: feed } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const feed = await getFeed()

      // Prefetch graph data for all graph items in parallel
      feed
        .filter(item => item.type === 'GRAPH')
        .forEach(item => {
          void queryClient.prefetchQuery({
            queryKey: ['graph', item.id],
            queryFn: () => getGraphData(item.id),
          })
        })

      return feed
    },
  })

  return (
    <div>
      {feed?.map(item =>
        item.type === 'GRAPH'
          ? <GraphWidget id={item.id} key={item.id} /> // Cache already warm!
          : <TextWidget item={item} key={item.id} />
      )}
    </div>
  )
}
```

The graph requests still begin only after `getFeed()` resolves; the optimization is the head start before child mounting, not parallel execution with the prerequisite. Avoid prefetching a large fan-out speculatively. Prefer a flattened backend response or route-level prefetch when the data contract can provide all required keys earlier.

When a route already knows the key, prefetch before rendering instead of coupling the side effect to another query function:

```typescript
await queryClient.prefetchQuery({
  queryKey: ['graph', graphId],
  queryFn: () => getGraphData(graphId),
})
```

Reference: [TanStack Query prefetching](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)
