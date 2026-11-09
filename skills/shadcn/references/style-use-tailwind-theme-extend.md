---
title: Define Tailwind Theme Tokens in CSS
impact: HIGH
impactDescription: keeps shadcn and Tailwind tokens reusable and consistent with the CSS-first configuration model
tags: style, tailwind, theme, design-tokens, configuration
---

## Define Tailwind Theme Tokens in CSS

Define reusable design tokens with `@theme`, or map existing shadcn CSS variables with `@theme inline`. Keep tokens in CSS. A JavaScript `theme.extend` config is read only when the stylesheet loads it with `@config "./tailwind.config.ts";`; prefer `@theme` for new tokens and reserve `@config` for a config file you intend to keep.

**Incorrect (tokens in a JavaScript config that is never loaded):**

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: { colors: { brand: '#2563eb' } },
  },
}
```

**Correct (CSS-first theme tokens):**

```css
/* app.css */
@import "tailwindcss";

:root {
  --brand-surface: oklch(0.35 0.08 255);
  --brand-foreground: oklch(0.95 0.02 255);
}

.dark {
  --brand-surface: oklch(0.24 0.06 255);
  --brand-foreground: oklch(0.97 0.01 255);
}

@theme inline {
  --color-brand: var(--brand-surface);
  --color-brand-foreground: var(--brand-foreground);
}
```

```tsx
function BrandedCard() {
  return (
    <Card className="bg-brand text-brand-foreground">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

Use semantic names when a token represents a role (`background`, `destructive`, `brand`) and scale names when consumers genuinely choose tonal steps. Arbitrary values remain appropriate for one-off values that are not design-system tokens.

References:
- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
