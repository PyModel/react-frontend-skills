---
title: Choose an Explicit Unknown-Key Policy
impact: MEDIUM-HIGH
impactDescription: makes rejection, stripping, or preservation of unknown keys deliberate
tags: object, strictObject, looseObject, unknown-keys
---

## Choose an Explicit Unknown-Key Policy

`z.object()` strips unrecognized keys by default. In Zod 4, prefer the top-level object constructors when a non-default policy matters: `z.strictObject()` rejects unknown keys and `z.looseObject()` preserves them. The legacy `.strict()`, `.strip()`, and `.passthrough()` methods remain for compatibility but are deprecated guidance.

**Default: strip unknown keys:**

```typescript
import * as z from 'zod'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
})

userSchema.parse({ id: '123', name: 'John', role: 'admin' })
// { id: '123', name: 'John' }
```

**Reject unknown keys at a closed boundary:**

```typescript
const apiRequestSchema = z.strictObject({
  action: z.string(),
  payload: z.unknown(),
})

apiRequestSchema.parse({
  action: 'create',
  payload: {},
  unexpected: true,
})
// ZodError: unrecognized key "unexpected"
```

**Preserve unknown keys for pass-through data:**

```typescript
const proxySchema = z.looseObject({
  id: z.string(),
})

proxySchema.parse({ id: '123', upstreamField: 'data' })
// { id: '123', upstreamField: 'data' }
```

**Validate additional keys:**

```typescript
const metadataSchema = z.object({
  id: z.string(),
}).catchall(z.string())
```

| Constructor | Unknown-key behavior | Typical use |
| --- | --- | --- |
| `z.object()` | Strip | General parsing and data projection |
| `z.strictObject()` | Reject | Closed API contracts and typo detection |
| `z.looseObject()` | Preserve | Proxies and intentionally extensible payloads |
| `.catchall(schema)` | Validate and preserve | Typed extension fields |

Unknown-key rejection is not a substitute for authorization or output allow-listing. Choose the policy from the boundary contract.

Reference: [Zod object schemas](https://zod.dev/api#objects)
