---
title: Use Trailing Important Modifier
impact: HIGH
impactDescription: prevents silently ignored important flags
tags: util, important, modifier, syntax
---

## Use Trailing Important Modifier

Write the important modifier (`!`) at the end of the utility, after any variants: `bg-red-500!`.

**Example:**

```html
<div class="flex! bg-red-500! p-4!">...</div>
```

**With variants:**

```html
<div class="hover:bg-blue-500!">...</div>
```

**Benefits:**
- Reads left-to-right naturally
- Easier to spot important overrides
- Consistent with other modifier patterns

Reference: [Tailwind CSS Important Modifier](https://tailwindcss.com/docs/styling-with-utility-classes#using-the-important-modifier)
