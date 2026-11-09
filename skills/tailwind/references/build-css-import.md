---
title: Import Tailwind With a Single CSS Import
impact: CRITICAL
impactDescription: enables automatic content detection with zero configuration
tags: build, import, css, configuration
---

## Import Tailwind With a Single CSS Import

Load Tailwind with one `@import "tailwindcss";` statement. This enables automatic content detection and the full set of CSS-first features (`@theme`, `@utility`, `@source`).

**Correct:**

```css
/* styles.css */
@import "tailwindcss";
/* Automatic content detection, zero configuration */
```

**Benefits:**
- Zero configuration required for most projects
- Automatic template file detection
- Built-in `@import` support without additional plugins
- Single source of truth for styles

Reference: [Tailwind CSS Installation](https://tailwindcss.com/docs/installation)
