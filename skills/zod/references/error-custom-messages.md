---
title: Provide Custom Error Messages
impact: HIGH
impactDescription: Default messages like "Expected string, received number" confuse users; custom messages like "Email is required" are actionable
tags: error, messages, user-experience, validation
---

## Provide Custom Error Messages

Zod's default error messages are technical and confusing for end users. Provide custom messages that are clear, specific, and actionable. This dramatically improves user experience when validation fails.

**Incorrect (default error messages):**

```typescript
import { z } from 'zod'

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  age: z.number().min(18),
})

signupSchema.parse({ email: 'bad', password: '123', age: 15 })
// ZodError issues:
// - "Invalid email"
// - "String must contain at least 8 character(s)"
// - "Number must be greater than or equal to 18"
// Users see: "String must contain at least 8 character(s)" - what string?
```

**Correct (custom error messages):**

```typescript
import { z } from 'zod'

// Customize messages with the `error` param.
// It accepts a string, or a function that inspects the issue.
const signupSchema = z.object({
  email: z.email({
    error: (issue) =>
      issue.input === undefined ? 'Email is required' : 'Please enter a valid email address',
  }),

  password: z.string({
    error: (issue) => (issue.input === undefined ? 'Password is required' : 'Password must be text'),
  }).min(8, 'Password must be at least 8 characters'),

  age: z.number({
    error: (issue) => (issue.input === undefined ? 'Age is required' : 'Age must be a number'),
  }).min(18, 'You must be at least 18 years old'),
})

signupSchema.parse({ email: 'bad', password: '123', age: 15 })
// ZodError issues:
// - "Please enter a valid email address"
// - "Password must be at least 8 characters"
// - "You must be at least 18 years old"
```

**The `error` param (a string, or a function that inspects the issue):**

```typescript
const schema = z.string({
  // Inspect the issue to choose a message; return undefined to defer
  // to Zod's default for cases you don't handle.
  error: (issue) => {
    if (issue.input === undefined) return 'This field is required'
    if (issue.code === 'invalid_type') return 'This field must be text'
    return undefined
  },
})
.min(1, 'Cannot be empty')   // When length < 1
.max(100, 'Too long')        // When length > 100
```

**Using an error map for consistent messaging:**

```typescript
// An error map is a function returning a string, or undefined to
// defer. Switch on the string `issue.code`.
const customError = (issue: z.core.$ZodRawIssue): string | undefined => {
  if (issue.code === 'too_small') {
    return issue.origin === 'number'
      ? `Must be at least ${issue.minimum}`
      : `Must be at least ${issue.minimum} characters`
  }

  if (issue.code === 'invalid_type') {
    return 'Must be text'
  }

  return undefined // defer to Zod's default message
}

// Apply globally
z.config({ customError })

// Or per-parse
schema.parse(data, { error: customError })
```

**Good error message principles:**
- Say what's wrong: "Password too short" not "Invalid password"
- Say how to fix it: "at least 8 characters" not just "too short"
- Use user's language: "email" not "string field at path .email"
- Be specific: "Must be a positive number" not "Invalid"

**When NOT to use this pattern:**
- Internal development scripts where technical errors are fine
- When you'll map errors to user-facing messages in the UI layer

Reference: [Zod Error Customization](https://zod.dev/error-customization)
