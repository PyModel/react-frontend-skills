---
title: Prefetch on Hover for Perceived Speed
impact: HIGH
impactDescription: head start before navigation
tags: prefetch, hover, intent, perceived-performance
---

## Prefetch on Hover for Perceived Speed

Hover or keyboard focus can signal navigation intent and give a likely destination a head start. Prefetch only when the data cost, cache lifetime, and likelihood of navigation justify the request; a prefetched query may still be stale or pending when navigation occurs.

**Without prefetch:**

```typescript
function ProjectLink({ projectId }: { projectId: string }) {
  return (
    <Link href={`/projects/${projectId}`}>
      View Project
    </Link>
  )
  // User clicks → navigate → fetch starts → loading spinner → content
}
```

**With hover prefetch:**

```typescript
function ProjectLink({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['project', projectId],
      queryFn: () => fetchProject(projectId),
      staleTime: 60_000, // Don't refetch if we have recent data
    })
  }

  return (
    <Link
      href={`/projects/${projectId}`}
      onMouseEnter={prefetch}
      onFocus={prefetch} // Keyboard accessibility
    >
      View Project
    </Link>
  )
  // User hovers → prefetch starts → user clicks → instant content
}
```

**Prefetch multiple related queries:**

```typescript
const prefetch = () => {
  queryClient.prefetchQuery(projectQueries.detail(projectId))
  queryClient.prefetchQuery(projectQueries.members(projectId))
  queryClient.prefetchQuery(projectQueries.activity(projectId))
}
```

**With queryOptions for type safety:**

```typescript
const projectQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: ['project', id],
      queryFn: () => fetchProject(id),
      staleTime: 60_000,
    }),
}

function ProjectLink({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  return (
    <Link
      href={`/projects/${projectId}`}
      onMouseEnter={() =>
        queryClient.prefetchQuery(projectQueries.detail(projectId))
      }
    >
      View Project
    </Link>
  )
}
```
