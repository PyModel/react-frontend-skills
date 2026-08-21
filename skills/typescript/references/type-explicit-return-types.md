---
title: Add Explicit Return Types to Exported Functions
impact: CRITICAL
impactDescription: can reduce declaration inference work and makes public contracts explicit
tags: type, return-types, exports, inference, performance
---

## Add Explicit Return Types to Exported Functions

For exported APIs in declaration-emitting libraries, an explicit named return type can reduce declaration inference work and prevents implementation details from leaking into the public `.d.ts` surface. Do not annotate every local function: inference is usually clearer and the benefit is workload-dependent.

**Incorrect (leaking a large inferred shape across a declaration boundary):**

```typescript
export function fetchUserProfile(userId: string) {
  // Compiler must analyze entire function body to infer return type
  return fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(data => ({
      id: data.id as string,
      name: data.name as string,
      email: data.email as string,
      createdAt: new Date(data.created_at),
      permissions: data.permissions as Permission[],
    }))
}
// Inferred: Promise<{ id: string; name: string; email: string; createdAt: Date; permissions: Permission[] }>
```

**Correct (named contract at the package boundary):**

```typescript
interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: Date
  permissions: Permission[]
}

export function fetchUserProfile(userId: string): Promise<UserProfile> {
  return fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(data => ({
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: new Date(data.created_at),
      permissions: data.permissions,
    }))
}
```

**Use inference by default when:**
- The function is private/local
- The inferred return is small and stable
- The project does not emit declarations for that boundary
- An annotation would merely repeat an obvious implementation type

**Benefits:**
- Declaration files use named type instead of expanded inline type
- Faster incremental compilation when function body changes
- Better error messages pointing to return type mismatch

Reference: [TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance#using-type-annotations)
