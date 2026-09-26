---
title: Use useTransition for Non-Blocking Updates
impact: CRITICAL
impactDescription: keeps UI responsive during heavy updates
tags: conc, useTransition, concurrent, non-blocking
---

## Use useTransition for Non-Blocking Updates

Wrap expensive state updates in `startTransition` to keep the UI responsive. React will interrupt the transition if higher-priority updates occur.

**Incorrect (blocking state update):**

```typescript
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  function handleSearch(value: string) {
    setQuery(value)
    // Expensive filtering blocks UI
    const filtered = filterResults(allItems, value)  // 1000+ items
    setResults(filtered)
  }

  return (
    <div>
      <input onChange={e => handleSearch(e.target.value)} />
      {/* Input feels sluggish during filtering */}
      <ResultsList results={results} />
    </div>
  )
}
```

**Correct (non-blocking with useTransition):**

```typescript
import { useState, useTransition } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    setQuery(value)  // Urgent - the input updates immediately
    startTransition(() => {
      // filterResults runs synchronously right here. Only the re-render
      // triggered by setResults is non-blocking and can be interrupted.
      const filtered = filterResults(allItems, value)
      setResults(filtered)
    })
  }

  return (
    <div>
      <input onChange={e => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </div>
  )
}
// Input stays responsive while results update in background
```

If filtering itself is the expensive part, filter during render from a deferred value (`useDeferredValue(query)`), so React can interrupt that work too.

Since React 19.3, separate `startTransition` calls render independently: a slow, suspended transition no longer holds up an unrelated one. Updates inside the same `startTransition` callback still commit together, so put updates that must appear together in one callback.

**When to use:**
- Filtering large lists
- Tab switches with heavy content
- Route transitions
- Any expensive re-render that shouldn't block input
