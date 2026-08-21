---
title: Debounce Search and Filter Inputs
impact: MEDIUM
impactDescription: reduces API calls during typing
tags: perf, debounce, search, filtering, api
---

## Debounce Search and Filter Inputs

Debounce server-bound or expensive search work when intermediate keystrokes are not useful. Do not debounce local filtering by default, and abort or ignore stale requests so older results cannot overwrite newer input.

**Incorrect (API call on every keystroke):**

```tsx
function SearchUsers() {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["users", query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isLoading && <Skeleton className="h-20" />}
      {/* Intermediate queries may replace each other while typing. */}
    </div>
  )
}
```

**Correct (debounced search):**

```tsx
import { useDebouncedValue } from "@/hooks/use-debounced-value"

function SearchUsers() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data, isLoading } = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: ({ signal }) => searchUsers(debouncedQuery, { signal }),
    enabled: debouncedQuery.length > 0,
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isLoading && <Skeleton className="h-20" />}
      {/* Requests receive TanStack Query's AbortSignal. */}
    </div>
  )
}
```

**useDebouncedValue hook:**

```tsx
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

Choose the delay from measured backend cost, product latency goals, and user behavior. Clearing, Enter submission, and explicit selections commonly need immediate handling.

References:
- [TanStack Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
- [React: you might not need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
