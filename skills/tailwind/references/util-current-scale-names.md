---
title: Use the Current Utility Scale Names
impact: MEDIUM
impactDescription: gives the intended size, radius, blur and ring width instead of an unexpectedly different one
tags: util, scale, shadow, rounded, blur, ring, outline
---

## Use the Current Utility Scale Names

Tailwind CSS 4.3 uses one consistent scale for shadows, radii and blurs, with a 1px `ring` and an explicit width for thicker rings. Pick the class that names the size you want.

**Incorrect (assuming `ring` is 3px and `outline-none` keeps an outline):**

```html
<input class="ring ring-blue-500 focus:outline-none" />
```

`ring` draws a 1px ring, and `outline-none` sets `outline-style: none`, which removes the focus indicator in forced-colors mode.

**Correct (explicit width, accessible outline reset):**

```html
<input class="ring-3 ring-blue-500 focus:outline-hidden" />
```

**Current scale:**

| Class | Meaning |
|-------|---------|
| `shadow-2xs`, `shadow-xs`, `shadow-sm` | Smallest box shadows, in that order |
| `inset-shadow-2xs`, `inset-shadow-xs`, `inset-shadow-sm` | Inset shadows on the same scale |
| `drop-shadow-xs`, `drop-shadow-sm` | Small filter drop shadows |
| `rounded-xs`, `rounded-sm` | Smallest border radii, in that order |
| `blur-xs`, `blur-sm`, `backdrop-blur-xs`, `backdrop-blur-sm` | Smallest blurs, in that order |
| `ring` | 1px ring, matching borders and outlines |
| `ring-3` | 3px ring |
| `outline-hidden` | Invisible outline that still shows in forced-colors mode |
| `outline-none` | `outline-style: none`, removes the outline entirely |
| `shrink-*`, `grow-*` | Flex shrink and grow |
| `text-ellipsis` | Truncate overflowing text with an ellipsis |
| `box-decoration-slice`, `box-decoration-clone` | How box decoration breaks across fragments |

Reference: [Tailwind CSS Box Shadow](https://tailwindcss.com/docs/box-shadow)
