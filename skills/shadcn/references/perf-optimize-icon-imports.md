---
title: Optimize Icon Imports from Lucide
impact: MEDIUM
impactDescription: keeps icon code tree-shakeable without losing type declarations
tags: perf, icons, lucide, tree-shaking, imports
---

## Optimize Icon Imports from Lucide

Import icons from the package entry and let the bundler tree-shake them. Lucide ships ESM modules with no side effects, and Next.js includes `lucide-react` in its default `optimizePackageImports` list, so a named import does not ship the whole icon set.

**Incorrect (deep path import):**

```tsx
import Check from "lucide-react/dist/esm/icons/check"
// Bypasses the package's type declarations: under strict/noImplicitAny this
// resolves to `any` unless you add a local declaration file.
```

**Correct (named import):**

```tsx
import { Check, X, Menu, Settings, User, Bell } from "lucide-react"
// The bundler keeps only the icons that are used.
```

**If a bundler does not tree-shake the package entry:**

```js
// next.config.js — lucide-react is optimized by default; list other icon
// libraries that need the same treatment.
module.exports = {
  experimental: {
    optimizePackageImports: ["@icon-library/core"],
  },
}
```

For Vite, named imports from an ESM package are tree-shaken by Rollup in production; `optimizeDeps.include` only pre-bundles dependencies for dev, so it is not a tree-shaking fix.

**Optional wrapper for naming consistency:**

```tsx
// components/icons.tsx
export { Check as CheckIcon, X as XIcon } from "lucide-react"
```

Reference: [Vercel Package Import Optimization](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
