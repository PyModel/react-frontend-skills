---
title: Use Only the Tailwind PostCSS Plugin
impact: HIGH
impactDescription: reduces plugin overhead, simplifies configuration
tags: build, postcss, plugins, configuration, optimization
---

## Use Only the Tailwind PostCSS Plugin

The `@tailwindcss/postcss` plugin already handles `@import` inlining, CSS nesting and vendor prefixing. Register it alone; extra plugins for the same jobs add build overhead and can conflict.

**Incorrect (redundant plugins):**

```javascript
// postcss.config.mjs
export default {
  plugins: [
    "postcss-import",
    "@tailwindcss/postcss",
    "autoprefixer",
  ],
};
```

**Correct (simplified configuration):**

```javascript
// postcss.config.mjs
export default {
  plugins: ["@tailwindcss/postcss"],
};
```

**Built into the plugin:**
- `@import` processing (no postcss-import needed)
- CSS nesting (no separate nesting plugin needed)
- Vendor prefixing (no autoprefixer needed)

Reference: [Tailwind CSS with PostCSS](https://tailwindcss.com/docs/installation/using-postcss)
