---
title: Await params and searchParams
impact: HIGH
impactDescription: avoids reading a Promise as an object, which yields undefined values at runtime
tags: server, params, searchparams, async
---

## Await params and searchParams

`params` is a Promise in pages, layouts, route handlers, `generateMetadata`, and metadata image routes; `searchParams` is a Promise in pages and `generateMetadata`. Type them as `Promise<...>` and await them. Read them with `await` in Server Components, or with React's `use()` in a Client Component that receives them as props (other Client Components use `useParams()`).

In an `opengraph-image`/`icon` image function, Next.js 16 passes both `params` and `id` as Promises (`await id`); `generateImageMetadata` still receives synchronous `params`.

**Pages await the Promise:**

```tsx
// app/blog/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  return <Article post={post} />
}
```

**`searchParams` follows the same rule:**

```tsx
// app/search/page.tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <Results query={q ?? ''} />
}
```

**Route handlers and metadata routes use the same shape:**

```ts
import type { Metadata } from 'next'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return Response.json(await getItem(id))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: slug }
}
```

**Client Components unwrap with `use()`:**

```tsx
'use client'

import { use } from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <Chart id={id} />
}
```

`generateStaticParams` still returns plain objects; only the `params` prop that a page or layout receives is a Promise.

Reference: [Next.js page params](https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional)
