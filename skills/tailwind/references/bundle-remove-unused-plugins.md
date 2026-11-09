---
title: Use Built-in Features Instead of Plugins
impact: HIGH
impactDescription: eliminates duplicate code, reduces dependencies
tags: bundle, plugins, container-queries, built-in, optimization
---

## Use Built-in Features Instead of Plugins

Container queries, aspect ratio, logical properties and 3D transforms ship in core Tailwind. Don't install `@tailwindcss/container-queries` or `@tailwindcss/aspect-ratio`; they duplicate core utilities.

**Incorrect (unnecessary plugins):**

```json
{
  "devDependencies": {
    "tailwindcss": "^4.3.0",
    "@tailwindcss/container-queries": "^0.1.0",
    "@tailwindcss/aspect-ratio": "^0.4.0"
  }
}
```

```css
/* Duplicate functionality */
@plugin "@tailwindcss/container-queries";
```

**Correct (core features only):**

```json
{
  "devDependencies": {
    "tailwindcss": "^4.3.0"
  }
}
```

```html
<!-- Container queries are built in -->
<div class="@container">
  <div class="@sm:grid-cols-3 @lg:grid-cols-4">Content</div>
</div>

<!-- Aspect ratio is built in -->
<div class="aspect-video">Video</div>
```

**Built into core:**
- Container queries (`@container`, `@sm:`, `@lg:`)
- Aspect ratio utilities
- Logical properties
- 3D transforms

Reference: [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design#container-queries)
