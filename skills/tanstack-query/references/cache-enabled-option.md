---
title: Use enabled for Conditional Queries
impact: HIGH
impactDescription: prevents invalid requests, enables dependent queries
tags: cache, enabled, conditional, dependent-queries
---

## Use enabled or skipToken for Conditional Queries

Queries run when mounted by default. Use `enabled` to pause based on runtime state, or `skipToken` when TypeScript should prevent the query function from existing until its input is available.

**Incorrect (query runs with undefined parameter):**

```typescript
function UserProfile({ userId }: { userId?: string }) {
  // Runs immediately, even when userId is undefined!
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!), // Dangerous assertion
  })
  // API receives: GET /users/undefined
}
```

**Correct (skipToken keeps the query function type-safe):**

```typescript
import { skipToken, useQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId?: string }) {
  const { data, isPending } = useQuery({
    queryKey: ['user', userId],
    queryFn: userId ? () => fetchUser(userId) : skipToken,
  })

  if (!userId) return <div>Select a user</div>
  if (isPending) return <Skeleton />
  return <div>{data.name}</div>
}
```

**Dependent queries (waterfall is intentional):**

```typescript
function UserProjects({ userId }: { userId: string }) {
  // First query: get user
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  // Second query: depends on user's organizationId
  const { data: projects } = useQuery({
    queryKey: ['projects', user?.organizationId],
    queryFn: () => fetchProjects(user!.organizationId),
    enabled: !!user?.organizationId, // Wait for user data
  })
}
```

**Skip query based on feature flag:**

```typescript
const { data: experiments } = useQuery({
  queryKey: ['experiments'],
  queryFn: fetchExperiments,
  enabled: featureFlags.experimentsEnabled,
})
```

**Behavior notes:**
- A disabled query with no cached data starts in `status: 'pending'` and `fetchStatus: 'idle'`; use both when distinguishing "not started" from active loading.
- `refetch()` cannot execute a query whose `queryFn` is `skipToken`; use `enabled` if imperative refetch is part of the contract.
- Prefer restructuring the API to remove dependent waterfalls when both resources can be fetched together.

Reference: [TanStack Query disabling/pausing queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)
