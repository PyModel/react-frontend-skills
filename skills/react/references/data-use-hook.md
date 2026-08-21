---
title: Use the use() Hook for Promises in Render
impact: HIGH
impactDescription: cleaner async component code, Suspense integration
tags: data, use, promises, async
---

## Use the use() Hook for Promises in Render

The `use()` hook reads values from Promises and Context during render. It integrates with Suspense for declarative loading states.

**Incorrect (useEffect for data fetching):**

```typescript
'use client'

import { useState, useEffect } from 'react'

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <Skeleton />
  return <Profile user={user} />
}
```

**Correct (use() with Suspense):**

```typescript
'use client'

import { use, Suspense } from 'react'

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)  // Suspends until resolved
  return <Profile user={user} />
}

// In an RSC-capable framework, create the Promise in a Server Component
// or another framework-supported cached data source.
function UserPage({ userPromise }: { userPromise: Promise<User> }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  )
}
```

**use() with Context (conditional reading):**

```typescript
import { use } from 'react'

function Button({ showTheme }: { showTheme: boolean }) {
  // Can read context conditionally - not possible with useContext
  if (showTheme) {
    const theme = use(ThemeContext)
    return <button className={theme.button}>Click</button>
  }
  return <button>Click</button>
}
```

**Notes:**
- `use()` can read a Promise or Context conditionally, unlike conventional Hooks.
- Do not create a fresh uncached Promise during each Client Component render; React warns for unsupported uncached promises and retries can restart the work.
- Promise creation/serialization for Client Components is framework-dependent. Prefer a Server Component or a Suspense-compatible data library documented by the framework.
