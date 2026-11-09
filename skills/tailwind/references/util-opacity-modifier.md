---
title: Use Slash Opacity Modifier
impact: HIGH
impactDescription: one class per color instead of two
tags: util, opacity, modifier, colors, syntax
---

## Use Slash Opacity Modifier

Set color opacity with the slash modifier on the color utility (`bg-blue-500/50`). It works on every color utility and takes a theme step, an arbitrary value or a CSS variable color.

**Correct:**

```html
<div class="bg-blue-500/50">Single class with opacity</div>

<p class="text-black/75">Cleaner, more readable</p>
```

**With CSS variables and arbitrary values:**

```html
<div class="bg-(--brand-color)/50">Custom property</div>
<div class="bg-blue-500/[0.42]">Arbitrary opacity</div>
```

**Benefits:**
- Works with any color utility
- Compatible with CSS variables

Reference: [Tailwind CSS Color Opacity](https://tailwindcss.com/docs/background-color#changing-the-opacity)
