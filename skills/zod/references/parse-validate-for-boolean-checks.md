---
title: Use validate() for Yes/No Checks
impact: MEDIUM
impactDescription: validate() (Zod 4.6+) returns a boolean type guard without building a ZodError, but it narrows to the input type and yields no parsed value
tags: parse, validate, type-guard, boolean
---

## Use validate() for Yes/No Checks

`schema.validate(data)` (Zod 4.6+; the `z.validate(schema, data)` function exists since 4.5) returns `true` or `false` and never builds a `ZodError`. It is a type guard, but it narrows to the schema's **input** type, not its output. It returns no parsed value: no transforms, defaults or stripped keys.

**Incorrect (using validate() where the parsed output is needed):**

```typescript
import { z } from 'zod'

const Query = z.object({
  page: z.string().transform(Number),
})

function readPage(input: unknown) {
  if (Query.validate(input)) {
    // input is narrowed to { page: string }, the INPUT type.
    // The transform never ran: this is a string, not a number.
    return input.page + 1 // "21", not 3
  }
}
```

**Correct (validate() for a boolean, safeParse() for data):**

```typescript
import { z } from 'zod'

const Query = z.object({
  page: z.string().transform(Number),
})

// Only a yes/no answer is needed: no error object is allocated
const isQuery = (input: unknown) => Query.validate(input)

// The parsed, transformed value or the issues are needed: use safeParse
function readPage(input: unknown) {
  const result = Query.safeParse(input)
  if (!result.success) return undefined
  return result.data.page + 1 // number
}
```

**Async schemas:**

Sync `.validate()` throws on a schema with async refinements. Use `.validateAsync()` instead. It resolves to a plain `boolean` and is not a type guard.

```typescript
const Username = z.string().refine(async (name) => !(await isTaken(name)))

await Username.validateAsync('alice') // true | false
```

**When NOT to use this pattern:**
- You need the output value (transforms, defaults, coercion): use `safeParse`
- You need to show the user why the input failed: use `safeParse` and read `error.issues`

Reference: [Zod 4.6.0 release](https://github.com/colinhacks/zod/releases/tag/v4.6.0) · [Zod - Basic usage](https://zod.dev/basics)
