---
title: Avoid Parallel Mutations on Same Data
impact: MEDIUM
impactDescription: prevents race conditions and cache corruption
tags: mutation, parallel, race-condition, isPending
---

## Serialize or Version Conflicting Mutations

Parallel writes to the same resource can complete out of order. Choose a contract: disable duplicate submissions, debounce replaceable input, attach server-side versions/idempotency keys, or serialize mutations with a shared TanStack Query `scope.id`.

**Incorrect (allow parallel mutations):**

```typescript
function TodoItem({ todo }: { todo: Todo }) {
  const mutation = useMutation({
    mutationFn: updateTodo,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  return (
    <div>
      <input
        value={todo.title}
        onChange={(e) => mutation.mutate({ ...todo, title: e.target.value })}
        // User types fast: "H" "He" "Hel" "Hell" "Hello"
        // 5 parallel mutations, responses arrive out of order
        // Final state might be "Hel" instead of "Hello"!
      />
    </div>
  )
}
```

**Correct (debounce or disable during mutation):**

```typescript
function TodoItem({ todo }: { todo: Todo }) {
  const [title, setTitle] = useState(todo.title)
  const mutation = useMutation({
    mutationFn: updateTodo,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  // Debounce the mutation
  const debouncedSave = useDebouncedCallback((newTitle: string) => {
    mutation.mutate({ ...todo, title: newTitle })
  }, 500)

  return (
    <input
      value={title}
      onChange={(e) => {
        setTitle(e.target.value)
        debouncedSave(e.target.value)
      }}
    />
  )
}
```

**Serialize writes for the same resource:**

```typescript
function useTodoMutation(todoId: string) {
  return useMutation({
    mutationFn: updateTodo,
    scope: { id: `todo:${todoId}` },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['todos', todoId] }),
  })
}
```

Mutations with the same scope ID run serially; different resources can still mutate concurrently. Serialization preserves submission order but does not replace server-side concurrency control.

**Alternative: disable duplicate submission:**

```typescript
function SaveButton({ todo }: { todo: Todo }) {
  const mutation = useMutation({ mutationFn: updateTodo })

  return (
    <button
      onClick={() => mutation.mutate(todo)}
      disabled={mutation.isPending} // Prevent double-click
    >
      {mutation.isPending ? 'Saving...' : 'Save'}
    </button>
  )
}
```
