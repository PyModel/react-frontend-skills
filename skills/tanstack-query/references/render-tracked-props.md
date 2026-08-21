---
title: Preserve Tracked-Property Optimization
impact: LOW
impactDescription: prevents subscribing to unused state changes
tags: render, destructuring, optimization, tracked
---

## Preserve Tracked-Property Optimization

TanStack Query tracks property access by default. Destructuring only the properties you use is fine. Object-rest destructuring (`const { data, ...rest } = query`) reads all remaining properties and disables the benefit for that component.

**Incorrect (subscribed to unused properties):**

```typescript
function SimpleDisplay() {
  // Destructures everything, subscribed to all changes
  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    status,
    fetchStatus,
    // ... and more
  } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  })

  // But only uses data!
  return <div>{data?.value}</div>
}
```

**Correct (minimal destructuring):**

```typescript
function SimpleDisplay() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  })

  return <div>{data?.value}</div>
}
```

**Access properties only when needed:**

```typescript
function DataWithLoading() {
  const query = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  })

  // Access isPending only in the conditional
  if (query.isPending) return <Skeleton />

  // Access error only if checking for it
  if (query.isError) return <Error message={query.error.message} />

  // Access data for rendering
  return <div>{query.data?.value}</div>
}
```

**Avoid object rest:**

```typescript
// Reads all remaining fields and defeats tracked-property optimization.
const { data, ...queryMeta } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
})
```

Keep the default tracking behavior unless profiling justifies a manual `notifyOnChangeProps` list. Manual lists can create stale UI when a newly used property is omitted.
