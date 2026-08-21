---
title: Define Tailwind v4 Theme Tokens in CSS
impact: HIGH
impactDescription: keeps shadcn and Tailwind tokens reusable and consistent with the CSS-first configuration model
tags: style, tailwind-v4, theme, design-tokens, configuration
---

## Define Tailwind v4 Theme Tokens in CSS

For Tailwind CSS v4 projects, define reusable design tokens with `@theme` or map existing shadcn CSS variables with `@theme inline`. Do not present `theme.extend` in `tailwind.config.js` as the default current setup; JavaScript config is compatibility-only in v4 and is not auto-detected.

**Incorrect (assuming v4 auto-detects a JavaScript config):**

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

If a migrated project must retain a JavaScript config, load it explicitly with `@config`; do not mix two sources of truth without a migration reason.

References:
- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide#using-a-javascript-config-file)
