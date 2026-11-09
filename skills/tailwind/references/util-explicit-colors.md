---
title: Use Explicit Border and Ring Colors
impact: HIGH
impactDescription: prevents borders and rings that follow the text color unintentionally
tags: util, colors, borders, rings, defaults
---

## Use Explicit Border and Ring Colors

`border`, `divide`, `ring` and `outline` default to `currentColor`, so they take on the element's text color. Set the color explicitly, or define a base-layer default for the project.

**Incorrect (relying on an implicit color):**

```html
<div class="border px-4 py-3">
  <!-- Border color is whatever the text color is -->
</div>

<input class="ring" />
<!-- 1px ring in currentColor -->
```

**Correct (explicit colors):**

```html
<div class="border border-gray-200 px-4 py-3">Explicit gray border</div>

<input class="ring-2 ring-blue-500" />
```

**Project-wide default (optional):**

```css
@import "tailwindcss";

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}
```

**Defaults to remember:**

| Property | Default |
|----------|---------|
| Border color | `currentColor` |
| Ring color | `currentColor` |
| Ring width (`ring`) | `1px` |
| Placeholder | `currentColor` at 50% |

Reference: [Tailwind CSS Border Color](https://tailwindcss.com/docs/border-color)
