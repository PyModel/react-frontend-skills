---
title: Stack Variants Left to Right
impact: HIGH
impactDescription: prevents broken responsive/state styles
tags: util, variants, stacking, order, syntax
---

## Stack Variants Left to Right

Stacked variants apply in the order written, left to right: outer context first, inner context last. Order them the way you would say the condition aloud.

**Incorrect (inner variant first, selector chain is wrong):**

```html
<ul class="*:py-2 first:*:pt-0 last:*:pb-0">
  <!-- first/last now target the list itself, not its children -->
</ul>

<div class="group-hover:dark:bg-black">
  <!-- group-hover applied before dark -->
</div>
```

**Correct (left-to-right order):**

```html
<ul class="*:py-2 *:first:pt-0 *:last:pb-0">
  <!-- Child selector first, then first/last -->
</ul>

<div class="dark:group-hover:bg-black">
  <!-- dark first, then group-hover -->
</div>
```

**Reading order:**
- Read variants left to right
- Outer context first, inner context last
- Matches natural language: "in dark mode, on group hover, make background black"

Reference: [Tailwind CSS Hover, Focus and Other States](https://tailwindcss.com/docs/hover-focus-and-other-states)
