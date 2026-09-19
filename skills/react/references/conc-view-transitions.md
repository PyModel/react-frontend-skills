---
title: Animate UI Changes with ViewTransition
impact: MEDIUM
impactDescription: native View Transition API animations without manual class juggling
tags: react, animation, view-transition, transitions
---

## Animate UI Changes with ViewTransition

Stable since React 19.3. `<ViewTransition>` animates children as they enter, exit, move, or resize using the browser's View Transition API. Wrap any element whose mount/unmount or style change should animate; React picks the animation from how the tree changed.

**Incorrect (hand-rolled animation state):**

```tsx
// Manually toggling CSS classes around state changes
const [animating, setAnimating] = useState(false)

function removeItem(id: string) {
  setAnimating(true)
  startTransition(() => setItems(items.filter((i) => i.id !== id)))
  // Hope the CSS class lands before React re-renders...
  setTimeout(() => setAnimating(false), 300)
}
```

**Correct (ViewTransition handles enter/exit/move/resize):**

```tsx
import { ViewTransition, useState, startTransition } from 'react'

function TodoList() {
  const [showItem, setShowItem] = useState(false)
  return (
    <>
      <button onClick={() => startTransition(() => setShowItem(true))}>
        Show
      </button>
      {showItem && (
        <ViewTransition>
          <Item />
        </ViewTransition>
      )}
    </>
  )
}
// Animations trigger when an update inside startTransition
// mounts, unmounts, moves, or resizes the wrapped content
```

**Custom animations with addTransitionType:**

```tsx
import {
  ViewTransition,
  addTransitionType,
  startTransition,
} from 'react'

// In the component:
<ViewTransition
  default={{
    'navigation-back': 'slide-right',
    'navigation-forward': 'slide-left',
  }}>
  <Page />
</ViewTransition>

// In your router on navigation:
startTransition(() => {
  addTransitionType('navigation-' + navigationType)
})
// addTransitionType must be called inside startTransition;
// per-type values map a transition type to an animation name
```

**Notes:**

- Animations run on updates marked as Transitions (`startTransition`, `<Suspense>` reveals); sync `setState` updates do not animate by default.
- Per-side props (`enter`, `exit`, `update`, `share`, and `default`) map transition types (or `'none'`) to CSS animation names; `default="none"` opts content out.
- `<ViewTransition>` coordinates with `<Suspense>` so fallbacks, images, and fonts resolve before the transition completes.
- Requires the browser View Transition API (all modern browsers); in unsupported browsers React skips the animation and renders the update normally.
