---
title: Enable strictFunctionTypes for Sound Function Assignments
impact: CRITICAL
impactDescription: rejects unsafe function-parameter assignments and enables variance-based checking
tags: tscfg, strict, strictFunctionTypes, variance, performance
---

## Enable strictFunctionTypes for Sound Function Assignments

`strictFunctionTypes` checks function-typed properties contravariantly instead of permitting unsafe bivariance. Enable it through `strict` for correctness. Variance information can also help compiler performance for well-structured types, but do not present the flag as a standalone speed switch.

**Incorrect (unsafe bivariant assignment):**

```json
{
  "compilerOptions": {
    "strict": false,
    "strictFunctionTypes": false
  }
}
```

```typescript
type Handler<T> = (event: T) => void

// Unsafe: a callback that only accepts MouseEvent may be called with any Event.
const handler: Handler<Event> = (e: MouseEvent) => { } // Allowed without strict checking
```

**Correct (sound contravariant checking):**

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

```typescript
type Handler<T> = (event: T) => void

// Rejected: the assigned callback cannot handle every Event.
const handler: Handler<Event> = (e: MouseEvent) => { } // Error
```

TypeScript can use cached variance information for generic types instead of repeating some structural comparisons, which may improve checking performance. The exact effect depends on the type graph; correctness remains the reason to enable the flag.

**Note:** The `strict` flag enables `strictFunctionTypes` along with other strict options. Enable `strict` for all new projects.

**When bivariance is needed:**

```typescript
// Use method syntax for intentional bivariance
interface EventEmitter<T> {
  emit(event: T): void  // Method syntax = bivariant
}

// vs property syntax for contravariance
interface StrictEmitter<T> {
  emit: (event: T) => void  // Property syntax = contravariant
}
```

References:
- [TypeScript strictFunctionTypes](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html)
- [TypeScript performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance#using-faster-variance-checks)
