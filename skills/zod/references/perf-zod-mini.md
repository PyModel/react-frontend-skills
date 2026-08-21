---
title: Use Zod Mini for Bundle-Sensitive Applications
impact: LOW-MEDIUM
impactDescription: provides a functional, more tree-shakeable API for bundle-constrained clients
tags: perf, bundle, mini, tree-shaking
---

## Use Zod Mini for Bundle-Sensitive Applications

For frontend applications with measured bundle constraints, consider `zod/mini` (a subpath of the `zod` package). It exposes the same core schema types through a functional API that tree-shakes more effectively. Actual output depends on the schema and bundler; regular Zod remains the recommended default.

**When to consider Zod Mini:**

```typescript
// Your app if:
// - Bundle size is critical (mobile-first, slow networks)
// - Edge functions with size limits
// - Simple validation needs (no complex transforms)
// - Tree-shaking is important

// Regular Zod: ergonomic method API
import { z } from 'zod'

// Zod Mini: functional, tree-shakeable API
import * as z from 'zod/mini'
```

**Standard Zod (method chaining):**

```typescript
import { z } from 'zod'

// Methods are attached to schema objects - hard to tree-shake
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  age: z.number().int().positive(),
})

const result = userSchema.safeParse(data)
```

**Zod Mini (functional API):**

```typescript
import * as z from 'zod/mini'

// Functions are imported individually - tree-shakeable
const userSchema = z.object({
  name: z.pipe(z.string(), z.minLength(1), z.maxLength(100)),
  email: z.pipe(z.string(), z.email()),
  age: z.pipe(z.number(), z.int(), z.positive()),
})

const result = z.safeParse(userSchema, data)
```

**API differences:**

```typescript
// Standard Zod
z.string().min(5).max(100).email()
z.number().int().positive()
z.array(z.string()).min(1)
schema.parse(data)
schema.safeParse(data)

// Zod Mini
z.pipe(z.string(), z.minLength(5), z.maxLength(100), z.email())
z.pipe(z.number(), z.int(), z.positive())
z.pipe(z.array(z.string()), z.minLength(1))
z.parse(schema, data)
z.safeParse(schema, data)
```

**When to stick with regular Zod:**

```typescript
// Use regular Zod when:
// - Server-side where bundle size doesn't matter
// - Complex schemas with many transforms
// - Need full method chaining ergonomics
// - Bundle size isn't a constraint

// Measure the emitted bundle before switching APIs.
// Server-side code usually benefits more from regular Zod's ergonomics.
```

**Shared schemas between packages:**

```typescript
// shared-schemas/package.json
{
  "dependencies": {
    "zod": "^4.0.0"  // Zod Mini ships as the `zod/mini` subpath of `zod`
  }
}

// If you need both, Zod Mini schemas work with regular Zod
// But prefer consistency - pick one for your codebase
```

The Zod 4 launch benchmark measured a minimal core bundle at 5.36 kB gzip for regular Zod and 1.88 kB for Zod Mini. The current Zod Mini documentation shows different sizes for more complex schemas, so treat those figures as examples, not package-wide constants.

**When NOT to use this pattern:**
- Server-side applications (bundle size irrelevant)
- When method chaining ergonomics are preferred
- Complex schemas that benefit from full API

Reference: [Zod Mini](https://zod.dev/packages/mini)
