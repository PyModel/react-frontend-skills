---
title: Use Zod 4 Error Formatting Helpers
impact: HIGH
impactDescription: produces form-friendly or nested error structures without deprecated instance methods
tags: error, flattenError, treeifyError, forms, user-experience
---

## Use Zod 4 Error Formatting Helpers

`ZodError.issues` preserves complete issue metadata. For UI rendering, use the Zod 4 top-level helpers: `z.flattenError()` for one-level forms and `z.treeifyError()` for nested schemas. The instance methods `error.flatten()` and `error.format()` are deprecated.

**Incorrect (deprecated instance helper):**

```typescript
if (!result.success) {
  const errors = result.error.flatten()
}
```

**Correct (Zod 4 top-level helper):**

**Flat form errors:**

```typescript
import * as z from 'zod'

const formSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  password: z.string().min(8, { error: 'Password too short' }),
})

const result = formSchema.safeParse(data)

if (!result.success) {
  const { formErrors, fieldErrors } = z.flattenError(result.error)

  // formErrors: string[] for root-level issues
  // fieldErrors: { [field: string]: string[] | undefined }
  console.log(fieldErrors.email)
}
```

`z.flattenError()` groups by the first path segment. Do not expect dotted keys for deeply nested fields.

**Nested errors:**

```typescript
const nestedSchema = z.object({
  profile: z.object({
    name: z.string().min(1, { error: 'Name required' }),
  }),
})

const result = nestedSchema.safeParse(data)

if (!result.success) {
  const tree = z.treeifyError(result.error)
  const nameErrors = tree.properties?.profile?.properties?.name?.errors
}
```

**Full metadata or custom mapping:**

```typescript
if (!result.success) {
  for (const issue of result.error.issues) {
    console.log(issue.code, issue.path, issue.message)
  }
}
```

`z.flattenError()` also accepts a mapper when a shallow form needs selected issue metadata:

```typescript
if (!result.success) {
  const errors = z.flattenError(result.error, (issue) => ({
    code: issue.code,
    message: issue.message,
  }))
}
```

When using `@hookform/resolvers/zod`, consume React Hook Form's `formState.errors`; the resolver performs its own mapping.

Reference: [Zod error formatting](https://zod.dev/error-formatting)
