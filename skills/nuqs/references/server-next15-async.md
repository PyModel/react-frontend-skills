---
title: Await searchParams in Next.js App Router Pages
impact: HIGH
impactDescription: prevents build errors from treating async searchParams as a plain object
tags: server, nextjs, async, searchParams, promise
---

## Await searchParams in Next.js App Router Pages

In the Next.js App Router, a page's `searchParams` prop is a Promise that must be awaited. Passing it to the cache without `await` causes TypeScript errors and runtime issues.

**Incorrect (no await, wrong prop type):**

```tsx
// app/search/page.tsx
import { searchParamsCache } from '@/lib/searchParams'

type PageProps = {
  searchParams: { q?: string } // Wrong type: it is a Promise
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = searchParamsCache.parse(searchParams) // Type error
}
```

**Correct (await the Promise):**

```tsx
// app/search/page.tsx
import { searchParamsCache } from '@/lib/searchParams'
import type { SearchParams } from 'nuqs/server'

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page } = await searchParamsCache.parse(searchParams)

  return <Results query={q} page={page} />
}
```

Reference: [Next.js - page searchParams](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)
