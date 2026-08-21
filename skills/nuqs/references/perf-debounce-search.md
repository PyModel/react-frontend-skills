---
title: Debounce Server-Bound Search Updates
impact: MEDIUM
impactDescription: avoids a server request for each intermediate search value
tags: perf, debounce, limitUrlUpdates, search, server-load
---

## Debounce Server-Bound Search Updates

For `shallow: false` searches, use nuqs' `debounce()` rate limit so the URL and server update after typing settles. The hook state still updates immediately. Prefer a call-level debounce because clearing the field or pressing Enter usually needs an immediate update.

**Incorrect (every value triggers server navigation):**

```tsx
const [query, setQuery] = useQueryState(
  'q',
  parseAsString.withOptions({ shallow: false })
)

<input value={query ?? ''} onChange={(event) => setQuery(event.target.value)} />
```

**Correct (rate-limit the server-bound URL update):**

```tsx
'use client'

import { useTransition } from 'react'
import {
  debounce,
  defaultRateLimit,
  parseAsString,
  useQueryState,
} from 'nuqs'

export default function SearchBox() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({
      shallow: false,
      startTransition,
    })
  )

  return (
    <label>
      Search
      <input
        value={query}
        onChange={(event) => {
          const value = event.target.value
          void setQuery(value || null, {
            limitUrlUpdates:
              value === '' ? defaultRateLimit : debounce(500),
          })
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            void setQuery(query || null, {
              limitUrlUpdates: defaultRateLimit,
            })
          }
        }}
      />
      {isPending ? <span>Searching…</span> : null}
    </label>
  )
}
```

Debouncing URL writes is intended for server-side fetching through RSCs or route loaders. If TanStack Query or another client library fetches from the hook's returned state, debounce that state before invoking the client query instead; nuqs state itself is immediate.

`useDeferredValue` defers rendering work; it does not impose a fixed debounce window and is not a substitute for controlling server request frequency:

```tsx
// This can defer rendering but does not guarantee one request after 500 ms.
const deferredQuery = useDeferredValue(query)
useQuery({ queryKey: ['search', deferredQuery], queryFn: search })
```

Reference: [nuqs debounce option](https://nuqs.dev/docs/options#debounce)
