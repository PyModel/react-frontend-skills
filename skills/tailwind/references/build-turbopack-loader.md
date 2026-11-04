---
title: Use the Turbopack Loader in Next.js
impact: MEDIUM
impactDescription: first-party Tailwind integration for Turbopack, no PostCSS config needed
tags: build, turbopack, nextjs, loader, tooling
---

## Use the Turbopack Loader in Next.js

> **Tailwind CSS 4.3.4+.** Next.js 16 builds with Turbopack by default. `@tailwindcss/turbopack` is a Turbopack loader for Tailwind CSS v4, so a Next.js app can compile Tailwind through Turbopack's own loader config instead of the PostCSS plugin. `@tailwindcss/postcss` keeps working; this removes a pipeline, it does not fix a bug.

**Incorrect (extra PostCSS pipeline just for Tailwind in a Turbopack app):**

```javascript
// postcss.config.mjs
export default {
  plugins: ["@tailwindcss/postcss"],
};
```

**Correct (register the loader for CSS files):**

```bash
npm install @tailwindcss/turbopack
```

```javascript
// next.config.js
module.exports = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}
```

```css
/* app/globals.css */
@import "tailwindcss";
```

**Loader options** (pass with `{ loader: '@tailwindcss/turbopack', options: { ... } }` in `loaders`):

- `base`: directory scanned for class candidates. Defaults to the current working directory.
- `optimize`: optimize and minify the output CSS. Defaults to `true` in production mode; accepts `true` or `{ minify: true }`.

**When NOT to use this pattern:**
- Webpack builds (`next build --webpack`) or other bundlers: use `@tailwindcss/postcss`, `@tailwindcss/vite` or `@tailwindcss/webpack`
- Apps whose PostCSS pipeline carries other required plugins; keep [`@tailwindcss/postcss`](build-postcss-simplify.md)
- Use 4.3.4 or newer: earlier loader builds served stale CSS in `next dev` after editing the CSS file (fixed in 4.3.4, #20582)

Reference: [@tailwindcss/turbopack README](https://github.com/tailwindlabs/tailwindcss/tree/v4.3.4/packages/@tailwindcss-turbopack) · [Tailwind CSS v4.3.4](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.4)
