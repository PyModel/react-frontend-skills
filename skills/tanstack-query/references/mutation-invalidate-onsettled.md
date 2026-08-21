---
title: Choose Mutation Invalidation Callbacks by Contract
impact: HIGH
impactDescription: keeps cached data consistent without unconditional refetches
tags: mutation, invalidation, onSettled, onSuccess, optimistic-updates
---

## Choose Mutation Invalidation Callbacks by Contract

There is no universal rule to invalidate in `onSettled` instead of `onSuccess`. Choose from what the server can change and whether the mutation used an optimistic cache update.

**Incorrect (unconditional invalidation for an ordinary mutation):**

```typescript
useMutation({
  mutationFn: createTodo,
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})
```

This refetches after an ordinary rejection even when the server made no change.

**Correct (invalidate from the callback that matches the mutation contract):**

**Ordinary mutation: invalidate after confirmed success:**

```typescript
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

A rejected mutation that made no server-side change does not normally make successful cached data stale, so unconditional error-path invalidation wastes a request.

**Optimistic mutation: roll back errors and reconcile after settlement:**

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (nextTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previous = queryClient.getQueryData<Todo[]>(['todos'])

    queryClient.setQueryData<Todo[]>(['todos'], (current = []) =>
      current.map((todo) => (todo.id === nextTodo.id ? nextTodo : todo))
    )

    return { previous }
  },
  onError: (_error, _variables, context) => {
    queryClient.setQueryData(['todos'], context?.previous)
  },
  onSettled: async () => {
    await queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

Return/await the invalidation Promise when the mutation should remain pending until fresh data arrives. If a failed request can partially commit on the server, make that protocol explicit (idempotency key, operation status, or reconciliation endpoint) rather than assuming every failure did or did not mutate state.

Reference: [TanStack Query invalidations from mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
