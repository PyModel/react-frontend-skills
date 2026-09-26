---
title: Use Dynamic Imports for Heavy Components
impact: CRITICAL
impactDescription: 30-70% smaller initial bundle
tags: build, dynamic-import, code-splitting, lazy-loading
---

## Use Dynamic Imports for Heavy Components

Large components like charts, editors, or maps should load on demand. Use `next/dynamic` to split them into separate bundles that load only when rendered.

**Incorrect (always included in main bundle):**

```typescript
import HeavyChart from '@/components/HeavyChart'
import CodeEditor from '@/components/CodeEditor'

export default function Dashboard() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div>
      {showChart && <HeavyChart />}
      <CodeEditor />
    </div>
  )
}
// Both components in initial bundle (~500KB added)
```

**Correct (loaded on demand):**

```typescript
'use client' // ssr: false is not allowed in Server Components

import { useState } from 'react'
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />
})

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false  // Client-only component
})

export default function Dashboard() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div>
      {showChart && <HeavyChart />}
      <CodeEditor />
    </div>
  )
}
// Components loaded only when rendered
```

**When to use `ssr: false`:** For libraries that touch `window` or `document` when imported, or when you also want the code split out of the server bundle. It only works from a Client Component. For a component that merely reads browser APIs while rendering, React 19.3's `use(browser())` inside `<Suspense>` skips its server render without a dynamic import (see the react skill's `effect-use-browser-only`).

Reference: [Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
