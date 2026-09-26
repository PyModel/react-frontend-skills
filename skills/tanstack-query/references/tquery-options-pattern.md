---
title: Use queryOptions for Type-Safe Sharing
impact: HIGH
impactDescription: type-safe prefetching and cache access
tags: query, queryOptions, typescript, prefetching
---

## Use queryOptions for Type-Safe Sharing

When sharing query configuration between `useQuery`, `queryClient.query` (which replaces the deprecated `prefetchQuery`/`fetchQuery`/`ensureQueryData` since v5.102), and `getQueryData`, inline objects lose type inference. The `queryOptions` helper preserves types across all usage sites.

**Incorrect (repeated configuration, lost types):**

```typescript
// In component
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
})

// In prefetch - duplicated, no type link
await queryClient
  .query({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })
  .catch(noop)

// getQueryData returns unknown
const user = queryClient.getQueryData(['user', userId])
// user is unknown, need manual cast
```

**Correct (queryOptions shares types):**

```typescript
// Define once with queryOptions
const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['user', userId] as const,
    queryFn: () => fetchUser(userId),
  })

// In component - fully typed
const { data } = useQuery(userQueryOptions(userId))

// In prefetch - same options, same types
await queryClient.query(userQueryOptions(userId)).catch(noop)

// getQueryData is now typed!
const user = queryClient.getQueryData(userQueryOptions(userId).queryKey)
// user is User | undefined, not unknown
```

**Combine with query key factories:**

```typescript
export const userQueries = {
  detail: (userId: string) =>
    queryOptions({
      queryKey: userKeys.detail(userId),
      queryFn: () => fetchUser(userId),
    }),
  list: (filters: UserFilters) =>
    queryOptions({
      queryKey: userKeys.list(filters),
      queryFn: () => fetchUsers(filters),
    }),
}

// Usage
const { data } = useQuery(userQueries.detail(userId))
await queryClient.query(userQueries.list({ role: 'admin' })).catch(noop)
```

Reference: [TanStack Query - TypeScript](https://tanstack.com/query/v5/docs/react/typescript)
