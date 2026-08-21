---
title: Hoist Loop-Invariant Work in Measured Hot Paths
impact: LOW-MEDIUM
impactDescription: avoids repeated invariant work when profiling identifies a hot loop
tags: runtime, loops, caching, property-access, optimization
---

## Hoist Loop-Invariant Work in Measured Hot Paths

Modern engines optimize ordinary property access and array lengths aggressively. Do not rewrite clear loops speculatively. When profiling identifies a hot loop, hoist values that are demonstrably invariant or expensive to compute, especially getters, proxy access, or repeated nested lookups.

**Incorrect (repeated property access):**

```typescript
function processOrders(orders: Order[], config: AppConfig): ProcessedOrder[] {
  const results: ProcessedOrder[] = []

  for (let i = 0; i < orders.length; i++) {  // orders.length accessed each iteration
    const tax = orders[i].total * config.tax.rate  // Nested access each time
    const shipping = config.shipping.rates[orders[i].region]  // Multiple nested accesses

    results.push({
      ...orders[i],
      tax,
      shipping,
      final: orders[i].total + tax + shipping
    })
  }

  return results
}
```

**Correct (cached property access):**

```typescript
function processOrders(orders: Order[], config: AppConfig): ProcessedOrder[] {
  const results: ProcessedOrder[] = []
  const { length } = orders
  const { rate: taxRate } = config.tax
  const { rates: shippingRates } = config.shipping

  for (let i = 0; i < length; i++) {
    const order = orders[i]
    const tax = order.total * taxRate
    const shipping = shippingRates[order.region]

    results.push({
      ...order,
      tax,
      shipping,
      final: order.total + tax + shipping
    })
  }

  return results
}
```

**For functional loops:**

```typescript
// Property access is implicit but still repeated
orders.forEach(order => {
  const tax = order.total * config.tax.rate
})

// Cache outside the callback
const taxRate = config.tax.rate
orders.forEach(order => {
  const tax = order.total * taxRate
})
```

**When this may matter:**
- Profiling identifies this loop as material
- The access invokes getters, proxies, or other non-trivial work
- Hoisting also clarifies that a value must stay invariant

**When to skip optimization:**
- Small arrays or infrequent execution
- When readability suffers significantly
- Modern engines optimize many common patterns

Reference: [V8 Hidden Classes](https://v8.dev/blog/fast-properties)
