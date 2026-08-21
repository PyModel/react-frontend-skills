---
title: Avoid Rebuilding Stable Schemas in Hot Paths
impact: LOW-MEDIUM
impactDescription: avoids repeated schema allocation when one reusable schema expresses the same contract
tags: perf, dynamic, hot-path, optimization
---

## Avoid Rebuilding Stable Schemas in Hot Paths

Zod schemas are immutable reusable values. Define a stable schema once when the validation contract is stable instead of reconstructing the same schema in a loop or on every render. Do not assume a fixed performance gain: measure schema construction and parsing in the target workload.

**Incorrect (same schema rebuilt for every item):**

```typescript
import * as z from 'zod'

function validateBatch(items: unknown[]) {
  return items.map((item) => {
    const schema = z.object({
      id: z.string(),
      value: z.number(),
    })

    return schema.safeParse(item)
  })
}
```

**Correct (stable schema reused):**

```typescript
import * as z from 'zod'

const itemSchema = z.object({
  id: z.string(),
  value: z.number(),
})

function validateBatch(items: unknown[]) {
  return items.map((item) => itemSchema.safeParse(item))
}
```

**Cache genuinely dynamic schemas only when identity and lifetime are bounded:**

```typescript
import * as z from 'zod'

interface FieldConfig {
  fields: readonly string[]
}

const schemaCache = new WeakMap<FieldConfig, z.ZodType>()

function getSchemaForConfig(config: FieldConfig) {
  const cached = schemaCache.get(config)
  if (cached) return cached

  const shape: Record<string, z.ZodString> = {}
  for (const field of config.fields) shape[field] = z.string()

  const schema = z.object(shape)
  schemaCache.set(config, schema)
  return schema
}
```

For an expensive schema used only on an uncommon path, lazy initialization can avoid startup work without rebuilding it on every call:

```typescript
let reportSchema: z.ZodType | undefined

function getReportSchema() {
  reportSchema ??= z.object({
    title: z.string(),
    rows: z.array(z.record(z.string(), z.unknown())),
  })
  return reportSchema
}
```

A factory is still appropriate when each call represents a genuinely different contract:

```typescript
function schemaForAllowedValues(values: readonly [string, ...string[]]) {
  return z.enum(values)
}
```

Do not cache by an unbounded user-controlled string key.

**When NOT to use this pattern:**
- A one-off schema outside a measured hot path
- A schema whose contract genuinely changes per request
- Tests where local construction makes each case clearer

Reference: [Zod 4 performance notes](https://zod.dev/v4#benchmarks)
