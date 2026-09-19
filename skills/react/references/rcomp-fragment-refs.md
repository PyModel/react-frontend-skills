---
title: Attach DOM Behavior to Siblings with Fragment Refs
impact: LOW-MEDIUM
impactDescription: ref access to child DOM without wrapper elements
tags: react, fragment, ref, dom, layout
---

## Attach DOM Behavior to Siblings with Fragment Refs

Stable since React 19.3. Passing a `ref` to `<Fragment>` returns a fragment instance with methods that act on the fragment's first-level DOM children — event listeners, focus, visibility observation — without inserting a wrapper `<div>` that would break layouts.

**Incorrect (wrapper div just to hold a ref):**

```tsx
function CardGroup({ children }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // observe cards...
    })
    ref.current?.querySelectorAll('.card').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // The extra div breaks grid/flex parent layouts
  return <div ref={ref}>{children}</div>
}
```

**Correct (Fragment ref, no wrapper):**

```tsx
import { Fragment, useRef, useLayoutEffect } from 'react'

function CardGroup({ children }) {
  const fragmentRef = useRef(null)

  useLayoutEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // track visibility...
    })
    // fragmentRef.current is a FragmentInstance
    fragmentRef.current?.observeUsing(observer)
    return () => {
      fragmentRef.current?.unobserveUsing(observer)
    }
  }, [])

  return <Fragment ref={fragmentRef}>{children}</Fragment>
}
```

**Common fragment instance methods:**

```tsx
fragmentRef.current.addEventListener('click', handler)
fragmentRef.current.removeEventListener('click', handler)
fragmentRef.current.focus()
fragmentRef.current.blur()
fragmentRef.current.observeUsing(observer)   // IntersectionObserver / ResizeObserver
fragmentRef.current.unobserveUsing(observer)
fragmentRef.current.getBoundingClientRect()  // union of children rects
fragmentRef.current.compareDocumentPosition(otherNode)
```

**Notes:**

- Methods target first-level DOM children only; nodes nested inside child components are not reached directly — lift the Fragment one level down if you need them.
- Combine with `<Fragment key={...}>` as before; keys and refs compose.
- Before 19.3 this API was experimental; remove any `'react-canary'` gating when upgrading.
