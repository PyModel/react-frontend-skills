---
title: Configure optimizePackageImports for Large Libraries
impact: HIGH
impactDescription: speeds up dev startup and trims bundles only for dependencies that are not optimized by default
tags: build, imports, tree-shaking, icons, turbopack
---

## Configure optimizePackageImports for Large Libraries

Some icon and component packages export hundreds of entry points. Next.js already optimizes a default list, including `lucide-react`, `@mui/material`, `@mui/icons-material`, `@heroicons/react/24/*` and `rxjs`, so adding them again changes nothing.

**Incorrect (configuring a library Next.js already optimizes):**

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

// components/Header.tsx
import { Menu, X, Search } from 'lucide-react'
// Already optimized: the extra entry is a no-op.
```

**Correct (add only a library that is not on the default list and is measurably slow):**

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@icon-library/core'],
  },
}

// components/Header.tsx
import { Menu, X, Search } from '@icon-library/core'
```

Check dev startup time or the bundle analyzer before adding an entry, and remove it if neither improves. The option lives under `experimental`.

Reference: [How we optimized package imports in Next.js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
