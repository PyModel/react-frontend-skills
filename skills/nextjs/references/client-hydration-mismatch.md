---
title: Avoid Hydration Mismatches
impact: LOW-MEDIUM
impactDescription: prevents React warnings, ensures correct rendering
tags: client, hydration, mismatch, ssr
---

## Avoid Hydration Mismatches

Server and client must render identical HTML. Avoid browser-only APIs, timestamps, and random values during initial render.

**Incorrect (hydration mismatch):**

```typescript
'use client'

export function Greeting() {
  // Different on server vs client
  const time = new Date().toLocaleTimeString()

  return <p>Current time: {time}</p>
}
// Server renders "10:30:00", client hydrates with "10:30:01" → mismatch!
```

**Correct (defer client-only values):**

```typescript
'use client'

import { useState, useEffect } from 'react'

export function Greeting() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Render nothing or placeholder on server
  if (!time) return <p>Loading time...</p>

  return <p>Current time: {time}</p>
}
```

**Correct (React 19.3+: skip server rendering for the component):**

```typescript
'use client'

import { Suspense, use, useEffect, useState } from 'react'
import { browser } from 'react-dom'

function Clock() {
  use(browser('shows the user local time')) // server renders the fallback
  const [time, setTime] = useState(() => new Date().toLocaleTimeString())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(interval)
  }, [])

  return <p>Current time: {time}</p>
}

export function Greeting() {
  return (
    <Suspense fallback={<p>Loading time...</p>}>
      <Clock />
    </Suspense>
  )
}
```

This drops the `null` state and the extra render. The effect remains only for the interval. See the react skill's `effect-use-browser-only`.

**Alternative (suppressHydrationWarning for known differences):**

```typescript
'use client'

export function Timestamp() {
  return (
    <time suppressHydrationWarning>
      {new Date().toLocaleTimeString()}
    </time>
  )
}
// Use sparingly - only when mismatch is intentional
```

**Common causes:**
- `Date.now()`, `Math.random()`
- `window.innerWidth`, `navigator.userAgent`
- Browser extensions modifying HTML
- Different locales on server/client
