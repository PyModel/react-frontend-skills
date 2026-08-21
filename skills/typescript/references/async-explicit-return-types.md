---
title: Annotate Async Function Return Types
impact: HIGH
impactDescription: prevents runtime errors, improves inference
tags: async, return-types, promises, type-safety, inference
---

## Annotate Public Async Function Contracts

Use explicit `Promise<...>` return types for exported APIs, callbacks implementing an interface, and declaration-emitting package boundaries. They catch implementation mismatches at the boundary. Prefer inference for small local async functions; do not add annotations solely as an unmeasured IDE optimization.

**Incorrect (inferred Promise type):**

```typescript
async function fetchUserOrders(userId: string) {
  const response = await fetch(`/api/users/${userId}/orders`)
  if (!response.ok) {
    return null  // Implicit: Promise<Order[] | null>
  }
  return response.json()  // Implicit: Promise<any>
}

// Caller has unclear type: Promise<any>
const orders = await fetchUserOrders('123')
orders.map(o => o.id)  // No type error even if orders is null
```

**Correct (explicit Promise type):**

```typescript
interface Order {
  id: string
  total: number
  status: OrderStatus
}

async function fetchUserOrders(userId: string): Promise<Order[] | null> {
  const response = await fetch(`/api/users/${userId}/orders`)
  if (!response.ok) {
    return null
  }
  const data: unknown = await response.json()
  return parseOrders(data) // Runtime validation returns Order[]
}

// Caller knows the exact type
const orders = await fetchUserOrders('123')
if (orders) {
  orders.map(o => o.id)  // Type-safe access
}
```

**For functions that might throw:**

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

async function fetchUserOrders(userId: string): Promise<Result<Order[]>> {
  try {
    const response = await fetch(`/api/users/${userId}/orders`)
    if (!response.ok) {
      return { ok: false, error: new Error(`HTTP ${response.status}`) }
    }
    const orders = await response.json() as Order[]
    return { ok: true, value: orders }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
}
```

**Benefits at a public boundary:**
- Return-shape drift is reported in the implementation
- Consumers receive a stable contract
- Declaration emit can name the result instead of expanding a large inferred type

A return annotation does not validate JSON at runtime. Parse untrusted responses before returning a typed value.

Reference: [TypeScript Handbook - Async Functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-7.html)
