---
title: Avoid await Inside Loops
impact: HIGH
impactDescription: scales linearly with the number of iterations
tags: async, loops, batching, waterfalls, performance
---

## Avoid await Inside Loops

`await` inside a loop serializes iterations. When iterations are independent and the downstream service can handle the concurrency, collect promises and await them together. Otherwise preserve order or use an explicit concurrency limit; unbounded `Promise.all()` can overload services and memory.

**Incorrect (N sequential requests):**

```typescript
async function enrichUsers(userIds: string[]): Promise<EnrichedUser[]> {
  const enrichedUsers: EnrichedUser[] = []

  for (const userId of userIds) {
    const user = await fetchUser(userId)  // Waits for each request
    const profile = await fetchProfile(userId)
    enrichedUsers.push({ ...user, profile })
  }
  // Every user waits for the previous user's requests.

  return enrichedUsers
}
```

**Correct (parallel execution):**

```typescript
async function enrichUsers(userIds: string[]): Promise<EnrichedUser[]> {
  const enrichedUsers = await Promise.all(
    userIds.map(async (userId) => {
      const [user, profile] = await Promise.all([
        fetchUser(userId),
        fetchProfile(userId),
      ])
      return { ...user, profile }
    })
  )
  // Independent users can progress concurrently.

  return enrichedUsers
}
```

**For rate-limited APIs (chunked batching):**

```typescript
async function enrichUsers(userIds: string[]): Promise<EnrichedUser[]> {
  const BATCH_SIZE = 5
  const results: EnrichedUser[] = []

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (userId) => {
        const [user, profile] = await Promise.all([
          fetchUser(userId),
          fetchProfile(userId),
        ])
        return { ...user, profile }
      })
    )
    results.push(...batchResults)
  }

  return results
}
```

**When sequential loop await is acceptable:**
- Each iteration depends on the previous result
- API strictly requires sequential calls
- Processing order affects correctness

Reference: [ESLint no-await-in-loop](https://eslint.org/docs/rules/no-await-in-loop)
