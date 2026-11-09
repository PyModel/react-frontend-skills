---
title: Use Parentheses for CSS Variable References
impact: MEDIUM-HIGH
impactDescription: correct syntax for variable-backed utilities, prevents ignored classes
tags: gen, variables, syntax, css
---

## Use Parentheses for CSS Variable References

Reference a CSS variable in a utility with parentheses: `bg-(--brand-color)`. Square brackets are for arbitrary static values.

**Incorrect (square brackets around a variable):**

```html
<div class="bg-[--brand-color]">
  <!-- Treated as a static value, not a var() reference -->
</div>

<div class="text-[--heading-size]">...</div>
```

**Correct (parentheses):**

```html
<div class="bg-(--brand-color)">
  <!-- Generates var(--brand-color) -->
</div>

<div class="text-(--heading-size)">...</div>
```

**Brackets for static values, parentheses for variables:**

```html
<div class="bg-[#ff5733]"><!-- Static arbitrary value --></div>
<div class="bg-(--custom-color)"><!-- CSS variable reference --></div>
```

Reference: [Tailwind CSS Arbitrary Values](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)
