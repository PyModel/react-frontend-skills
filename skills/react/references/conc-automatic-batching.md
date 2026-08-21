---
title: Leverage Automatic Batching for Fewer Renders
impact: HIGH
impactDescription: batches related state updates without manual wrappers
tags: conc, batching, automatic, performance
---

## Leverage Automatic Batching for Fewer Renders

React roots created with `createRoot` automatically batch related state updates, including updates from promises, timers, and native event handlers. This behavior arrived in React 18 and remains in React 19. Understand it to avoid unnecessary wrappers.

**Incorrect (forcing synchronous updates):**

```typescript
import { flushSync } from 'react-dom'

function handleClick() {
  // Don't do this - breaks automatic batching
  flushSync(() => {
    setCount(c => c + 1)
  })
  flushSync(() => {
    setFlag(f => !f)
  })
}
// Two renders instead of one
```

**Correct (letting React batch automatically):**

```typescript
function handleClick() {
  // React batches these - single render
  setCount(c => c + 1)
  setFlag(f => !f)
}

async function handleSubmit() {
  const data = await fetchData()
  // Modern createRoot-based React apps batch these updates.
  setData(data)
  setLoading(false)
  setError(null)
}
// Single render for all three updates
```

**When flushSync is appropriate:**

```typescript
function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
  const value = e.target.value
  setQuery(value)

  // Rare: need DOM measurement before next paint
  flushSync(() => {
    setResults(search(value))
  })
  // Now can measure DOM synchronously
  scrollToTop()
}
```

`unstable_batchedUpdates` is generally unnecessary in modern `createRoot` applications. Before removing a library integration, verify its renderer/root mode and tests; `flushSync` remains an intentional, rare opt-out when synchronous DOM observation is required.
