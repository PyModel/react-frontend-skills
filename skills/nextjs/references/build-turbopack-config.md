---
title: Configure Turbopack at the Top Level
impact: CRITICAL
impactDescription: uses the supported Next.js 16 bundler and cache configuration
tags: build, turbopack, caching, development
---

## Configure Turbopack at the Top Level

Next.js 16 uses Turbopack by default for both `next dev` and `next build`. Turbopack filesystem caching is also enabled by default for development and production builds. Do not add an opt-in flag merely to obtain the default behavior.

**Incorrect (removed or fictitious options):**

```typescript
const nextConfig = {
  experimental: {
    turbo: {
      persistentCaching: true,
    },
  },
}
```

**Correct (only configure supported custom behavior):**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
```

```bash
# Turbopack is the default in Next.js 16.
next dev
next build

# Use Webpack only when an unresolved compatibility requirement demands it.
next build --webpack
```

A custom `webpack` configuration makes the default `next build` fail rather than silently ignoring that configuration. Migrate the configuration, explicitly choose `--webpack`, or deliberately use `--turbopack` after confirming the Webpack customization is unnecessary.

The filesystem cache is local build output and must remain uncommitted. In Next.js 16.3+, both caches default to `true`. Set the documented experimental keys only to override those defaults for a demonstrated environment-specific reason:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
}

export default nextConfig
```

References:
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16#turbopack-by-default)
- [Turbopack filesystem cache](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache)
