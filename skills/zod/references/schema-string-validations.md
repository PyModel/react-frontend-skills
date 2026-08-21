---
title: Apply String Validations at Schema Definition
impact: CRITICAL
impactDescription: Unvalidated strings allow SQL injection, XSS, and malformed data; validating at schema level catches issues at the boundary
tags: schema, string, validation, security
---

## Apply String Validations at Schema Definition

Plain `z.string()` accepts any string, including empty or unexpectedly long values. Apply length and shape constraints at the boundary. In Zod 4, string formats such as email, URL, and UUID are top-level schemas (`z.email()`, `z.url()`, `z.uuid()`). Validation does not sanitize untrusted HTML or make a value safe for a SQL/HTML sink; use the appropriate output encoding and parameterization too.

**Incorrect (no string validations):**

```typescript
import { z } from 'zod'

const commentSchema = z.object({
  author: z.string(),  // Empty string passes
  email: z.string(),  // "not-an-email" passes
  content: z.string(),  // 10MB string passes, script tags pass
  website: z.string().optional(),  // "javascript:alert(1)" passes
})

// All of these pass validation
commentSchema.parse({
  author: '',  // Empty - who wrote this?
  email: 'invalid',  // Not a real email
  content: '<script>alert("XSS")</script>'.repeat(100000),  // XSS + huge
  website: 'javascript:void(0)',  // Dangerous URL
})
```

**Correct (string validations applied):**

```typescript
import { z } from 'zod'

const commentSchema = z.object({
  author: z.string()
    .min(1, 'Author is required')
    .max(100, 'Author name too long'),

  // Zod 4: format validators are top-level schemas,
  // not the deprecated z.string().email()/.url() methods.
  email: z.email('Invalid email address'),

  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment too long'),

  website: z.url('Invalid URL')
    .refine(
      url => url.startsWith('http://') || url.startsWith('https://'),
      'Only http/https URLs allowed'
    )
    .optional(),
})

// Invalid data is rejected
commentSchema.parse({
  author: '',
  email: 'invalid',
  content: '',
})
// ZodError with all violations listed
```

**Common string validations:**

```typescript
// Length / shape constraints are z.string() methods
z.string().min(1)  // Non-empty (most common need)
z.string().max(255)  // Database varchar limit
z.string().length(36)  // Exact length
z.string().regex(/^[a-z0-9-]+$/)  // Custom pattern (slugs)
z.string().startsWith('https://')  // Prefix check
z.string().endsWith('.pdf')  // Suffix check
z.string().includes('@')  // Contains check
z.string().trim()  // Strips whitespace (transform)
z.string().toLowerCase()  // Normalizes case (transform)

// Zod 4: string formats are top-level validators
z.email()  // Email format
z.url()  // URL format
z.uuid()  // UUID format
z.cuid()  // CUID format
```

**When NOT to use this pattern:**
- When accepting arbitrary user content for display only (sanitize on output instead)
- When building a passthrough/proxy that shouldn't validate content

Reference: [Zod API - Strings](https://zod.dev/api#strings)
