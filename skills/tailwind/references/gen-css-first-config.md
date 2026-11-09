---
title: Use CSS-First Configuration Over JavaScript
impact: CRITICAL
impactDescription: single source of truth, eliminates config file overhead
tags: gen, configuration, css-first, theme
---

## Use CSS-First Configuration Over JavaScript

Configure design tokens with the `@theme` directive in CSS rather than a JavaScript config file. This provides a single source of truth and eliminates the need for context switching.

**Incorrect (design tokens in a JavaScript config file):**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          100: "#e6f0ff",
          500: "#0066ff",
          900: "#003380",
        },
      },
      fontFamily: {
        display: ["Satoshi", "sans-serif"],
      },
    },
  },
};
```

**Correct (CSS-first with @theme):**

```css
/* styles.css */
@import "tailwindcss";

@theme {
  --color-brand-100: oklch(0.95 0.02 250);
  --color-brand-500: oklch(0.55 0.21 260);
  --color-brand-900: oklch(0.25 0.15 260);
  --font-display: "Satoshi", "sans-serif";
}
```

**Benefits:**
- All design tokens in one CSS file
- No JavaScript parsing overhead
- CSS variables available at runtime
- Better IDE autocomplete support

Reference: [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme)
