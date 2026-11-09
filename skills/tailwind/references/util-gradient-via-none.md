---
title: Use via-none to Reset Gradient Stops
impact: MEDIUM-HIGH
impactDescription: prevents unexpected gradient behavior with variants
tags: util, gradients, via, variants, colors
---

## Use via-none to Reset Gradient Stops

Gradient stops are preserved across variants: overriding `from-*` or `to-*` in a variant leaves the other stops intact. Use `via-none` to remove a middle stop in a variant.

**Incorrect (expecting the variant to reset the whole gradient):**

```html
<div class="bg-linear-to-r from-red-500 via-orange-400 to-yellow-400
            dark:from-blue-500 dark:to-teal-400">
  <!-- dark mode keeps via-orange-400 -->
</div>
```

**Correct (explicit via-none):**

```html
<div class="bg-linear-to-r from-red-500 via-orange-400 to-yellow-400
            dark:via-none dark:from-blue-500 dark:to-teal-400">
  <!-- Middle stop removed in dark mode -->
</div>
```

**How it works:**
- Each stop can be overridden individually
- Use `via-none` to turn a 3-stop gradient into a 2-stop gradient
- Consistent with how other utilities compose across variants

Reference: [Tailwind CSS Background Image](https://tailwindcss.com/docs/background-image)
