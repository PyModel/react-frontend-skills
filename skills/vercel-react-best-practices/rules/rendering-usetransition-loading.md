---
title: Use useTransition Over Manual Loading States
impact: LOW
impactDescription: reduces re-renders and improves code clarity
tags: rendering, transitions, useTransition, loading, state
---

## Use useTransition Over Manual Loading States

Use `useTransition` when an Action performs a non-urgent update and the UI should remain responsive. Its `isPending` state can replace some manual pending bookkeeping. It does not cancel requests or guarantee that async results commit in request order.

**Incorrect (manual loading state):**

```tsx
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setIsLoading(true)
    setQuery(value)
    const data = await fetchResults(value)
    setResults(data)
    setIsLoading(false)
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isLoading && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**Correct (useTransition with built-in pending state):**

```tsx
import { useRef, useState, useTransition } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()
  const latestRequest = useRef(0)

  const handleSearch = (value: string) => {
    setQuery(value) // Urgent input update
    const requestId = ++latestRequest.current

    startTransition(async () => {
      const data = await fetchResults(value)
      // Transitions do not cancel or order network requests.
      if (requestId === latestRequest.current) setResults(data)
    })
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**Benefits:**

- **Automatic pending state**: No need to manually manage `setIsLoading(true/false)`
- **Pending state**: React tracks the Action while it is in progress
- **Responsiveness**: Non-urgent rendering work can be interrupted
- **Ordering remains explicit**: Use `useActionState` for ordered Actions, or abort/version request-style work yourself

Handle errors inside the Action or with the framework's error boundary. Do not rely on a Transition to swallow an async error.

Reference: [useTransition](https://react.dev/reference/react/useTransition)
