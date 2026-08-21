---
title: Use extend() for Adding Fields
impact: MEDIUM-HIGH
impactDescription: Merging objects manually loses type information; extend() preserves types and allows overriding fields safely
tags: object, extend, composition, inheritance
---

## Use extend() for Adding Fields

When building on an existing object schema, use `.extend()` for a concise extension or object spread for the best TypeScript performance and explicit strictness. Both preserve inference. Regular `.extend()` throws when used on a schema that contains refinements; use `.safeExtend()` there. It additionally rejects an override whose schema is not assignable to the original.

**Incorrect (duplicating the base fields):**

```typescript
import { z } from 'zod'

const baseUserSchema = z.object({
  id: z.string(),
  name: z.string(),
})

// Duplicated fields drift when the base schema changes.
const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.literal('admin'),
  permissions: z.array(z.string()),
})
```

**Correct (using extend):**

```typescript
import { z } from 'zod'

const baseUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
})

// Extend to add fields
const adminUserSchema = baseUserSchema.extend({
  role: z.literal('admin'),
  permissions: z.array(z.string()),
})

type AdminUser = z.infer<typeof adminUserSchema>
// {
//   id: string;
//   name: string;
//   email: string;
//   role: 'admin';
//   permissions: string[];
// }

// Override existing fields
const strictEmailSchema = baseUserSchema.extend({
  email: z.email().endsWith('@company.com'),  // Stricter validation
})
```

**Building hierarchies with extend:**

```typescript
// Base entity with common fields
const entitySchema = z.object({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// User extends entity
const userSchema = entitySchema.extend({
  email: z.email(),
  name: z.string(),
})

// Product extends entity
const productSchema = entitySchema.extend({
  name: z.string(),
  price: z.number().positive(),
  sku: z.string(),
})

// Order extends entity with references
const orderSchema = entitySchema.extend({
  userId: z.uuid(),
  items: z.array(z.object({
    productId: z.uuid(),
    quantity: z.number().int().positive(),
  })),
  total: z.number().positive(),
})
```

**Combining extend with other methods:**

```typescript
const baseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

// Create input: no id, add password
const createSchema = baseSchema
  .omit({ id: true })
  .extend({
    password: z.string().min(8),
  })

// Update input: all optional except id
const updateSchema = baseSchema
  .partial()
  .extend({
    id: z.string(),  // Override to make required
  })
```

**Combine independent object shapes:**

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
})

const contactSchema = z.object({
  email: z.email(),
  phone: z.string(),
})

// Object spread is the Zod 4 replacement for deprecated .merge().
const customerSchema = z.object({
  ...addressSchema.shape,
  ...contactSchema.shape,
})
```

**When NOT to use this pattern:**
- When both schemas must validate independently and overlapping fields must satisfy both; use an intersection
- When you need to remove fields; use `.omit()`

Reference: [Zod API - extend](https://zod.dev/api#extend)
