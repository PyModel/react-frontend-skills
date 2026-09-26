---
title: Use use(browser()) for Client-Only Rendering
impact: MEDIUM
impactDescription: React 19.3's browser() skips server rendering for one component and streams a Suspense fallback, replacing mounted-flag effects and the double render they cause
tags: effect, browser, ssr, hydration, suspense, client-only
---

## Use use(browser()) for Client-Only Rendering

Some components can't produce meaningful output on the server: they read the time zone, `localStorage` or the viewport. React 19.3 adds `browser()` to `react-dom` for this case. Pass its result to `use()`. On the server, rendering stops there and the nearest `<Suspense>` fallback goes into the HTML. In the browser, `use(browser())` returns immediately and the component renders normally. There is no hydration mismatch and no extra render.

**Incorrect (mounted flag: renders twice and flashes the placeholder):**

```tsx
'use client'

import { useEffect, useState } from 'react'

export function LocalTime() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), []) // extra render after hydration

  if (!mounted) return <p>Loading…</p>
  return <p>{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
}
```

**Correct (bail out of server rendering at the browser-only line):**

```tsx
'use client'

import { Suspense, use } from 'react'
import { browser } from 'react-dom'

function LocalTime() {
  use(browser('needs the user time zone')) // server: render the fallback instead
  return <p>{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
}

export function LocalTimeSlot() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <LocalTime />
    </Suspense>
  )
}
```

**Rules:**
- A `<Suspense>` boundary must sit above the component. Without one, the server render fails.
- It only works in Client Components. `browser()` on its own does nothing; always pass it to `use()`.
- Like other `use()` calls, it may appear after an early return or inside a condition.
- The string argument is a reason for logs. The server's `onBrowserBailout(error, info)` callback receives it as `error.cause`. Bailouts are not reported to `onError` or `onRecoverableError`.
- Effects are still needed for subscriptions and timers (for example `setInterval`). `browser()` only replaces the "am I on the client yet" flag.

**When NOT to use this pattern:**
- The library touches `window` at import time, or you want its code split out: `use(browser())` doesn't code-split, so the module still loads on the server. Use `next/dynamic` with `ssr: false` from a Client Component instead.
- Values that can be rendered on the server and only differ slightly (such as a timestamp): render a stable value, or use `suppressHydrationWarning` on that one element.
- React versions before 19.3: `browser` is not exported. Keep the effect-based pattern.

Reference: [react.dev - browser](https://react.dev/reference/react-dom/browser) · [React 19.3 release](https://react.dev/blog/2026/09/09/react-19-3)
