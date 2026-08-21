---
title: Rely on Tracked Properties Before notifyOnChangeProps
impact: LOW-MEDIUM
impactDescription: preserves safe automatic subscriptions and reserves manual lists for measured cases
tags: render, notifyOnChangeProps, tracked-properties, optimization
---

## Rely on Tracked Properties Before notifyOnChangeProps

TanStack Query tracks which result properties a component reads and re-renders it when one of those properties changes. This is the default. Do not set `notifyOnChangeProps` merely because the result object contains many fields.

```typescript
function DataDisplay() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  })

  // The component is tracked for `data` because that is what it reads.
  return <div>{data?.value}</div>
}
```

Avoid object-rest destructuring because it reads every remaining property and defeats tracking:

```typescript
// Avoid
const { data, ...queryMeta } = useQuery(options)
```

Use `notifyOnChangeProps` only after profiling demonstrates a need and list every property that affects rendering:

```typescript
const { data, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  notifyOnChangeProps: ['data', 'error'],
})
```

An incomplete list can produce stale UI. `notifyOnChangeProps: 'all'` opts out of tracked-property optimization; it does not enable it. To warm another query without subscribing this component, call `queryClient.prefetchQuery()` from an event, loader, or deliberate effect instead of mounting a hidden `useQuery` with an empty notification list.

Reference: [TanStack Query render optimizations](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations#tracked-properties)
