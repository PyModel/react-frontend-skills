---
title: Verify Framework Compatibility Before Setup
impact: CRITICAL
impactDescription: selects the supported nuqs adapter and framework range
tags: setup, nextjs, version, compatibility, adapters
---

## Verify Framework Compatibility Before Setup

nuqs 2.x supports Next.js 14.2 or newer for both App and Pages Routers. Earlier Next.js releases require the legacy nuqs 1.x line; do not combine nuqs 2.x with an unsupported router version.

| Framework/router | Supported range for nuqs 2.x |
| --- | --- |
| Next.js App or Pages Router | `next >= 14.2.0` |
| React SPA | `react ^18.3 \|\| ^19` |
| React Router v6 | `react-router-dom ^6` |
| React Router v7 | `react-router ^7` |
| React Router v8 | `react-router ^8` |

**Incorrect (nuqs 2 with an unsupported Next.js release):**

```json
{
  "dependencies": {
    "next": "13.5.0",
    "nuqs": "^2.0.0"
  }
}
```

**Correct (supported Next.js range):**

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "nuqs": "^2.0.0"
  }
}
```

Inspect the installed versions rather than copying a version into `package.json`:

```bash
npm ls nuqs next react react-router react-router-dom
```

Choose the adapter that matches the actual router:

```tsx
// Next.js App Router
import { NuqsAdapter } from 'nuqs/adapters/next/app'

// Next.js Pages Router
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

// Mixed Next.js routers (slightly larger unified adapter)
import { NuqsAdapter } from 'nuqs/adapters/next'
```

When upgrading a working application, follow the nuqs migration guide and the framework's own migration guide; a blind `@latest` install can combine multiple unrelated major migrations.

Reference: [nuqs installation and compatibility](https://nuqs.dev/docs/installation)
