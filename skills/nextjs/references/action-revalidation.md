---
title: Revalidate Cache After Mutations
impact: MEDIUM
impactDescription: ensures fresh data after changes
tags: action, revalidation, cache, mutation
---

## Revalidate Cache After Mutations

After a mutation, invalidate only cached reads affected by the write. Use `revalidatePath` for route-level invalidation, `revalidateTag(tag, 'max')` for stale-while-revalidate content, or `updateTag(tag)` inside a Server Action for immediate read-your-writes behavior.

**Incorrect (stale cache after mutation):**

```typescript
'use server'

export async function deletePost(postId: string) {
  await db.posts.delete({ where: { id: postId } })
  redirect('/posts')
  // Posts list still shows deleted post from cache!
}
```

**Correct (invalidating cache):**

```typescript
'use server'

import { revalidatePath, revalidateTag, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePost(postId: string) {
  await db.posts.delete({ where: { id: postId } })

  // Option 1: Revalidate specific path
  revalidatePath('/posts')

  // Option 2: expire and immediately refresh for this user's write
  updateTag('posts')

  redirect('/posts')
}

export async function updatePost(postId: string, formData: FormData) {
  await db.posts.update({
    where: { id: postId },
    data: { title: formData.get('title') }
  })

  // Revalidate both the list and detail pages
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
}
```

**Revalidation strategies:**

```typescript
// Specific route
revalidatePath('/posts')

// Dynamic route with specific ID
revalidatePath(`/posts/${postId}`)

// All routes using a layout
revalidatePath('/dashboard', 'layout')

// Stale-while-revalidate for webhook/content updates
revalidateTag('posts', 'max')

// Immediate read-your-writes in a Server Action
updateTag('posts')
updateTag(`post-${postId}`)
```

`updateTag` requires `cacheComponents: true` and can only be called from a Server Action. In Route Handlers and webhooks use `revalidateTag(tag, 'max')` instead.

Reference: [Next.js updating cached data](https://nextjs.org/docs/app/getting-started/caching-and-revalidating#updating-data)
