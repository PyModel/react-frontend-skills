---
title: Validate Cross-Fields with the Form-Level validate Option
impact: MEDIUM-HIGH
impactDescription: cross-field rules without a schema library or wrapper components
tags: react-hook-form, validation, cross-field, useForm
---

## Validate Cross-Fields with the Form-Level validate Option

Since RHF 7.72, `useForm` accepts a built-in form-level `validate` function. Use it for cross-field rules (password confirmation, date ranges, dependent constraints) that previously required a schema resolver or watch-driven manual validation.

**Incorrect (watch + manual error injection for cross-field rules):**

```tsx
const password = watch('password')

useEffect(() => {
  if (confirmPassword && password !== confirmPassword) {
    setError('confirmPassword', { message: 'Passwords do not match' })
  }
}, [password, confirmPassword])
// Effect churn, stale errors after edits, easy to forget cleanup
```

**Correct (form-level validate):**

```tsx
const form = useForm<SignupValues>({
  validate: (values) => {
    if (values.password !== values.confirmPassword) {
      return { confirmPassword: 'Passwords do not match' }
    }
    if (values.endDate <= values.startDate) {
      return { endDate: 'End date must be after start date' }
    }
    return undefined
  },
})
// Return field-keyed errors (or a root error string) from one place;
// RHF runs it with the rest of validation and merges the results
```

**Notes:**

- The function receives all current values and returns an errors object keyed by field path, a root error string, or `undefined` when valid.
- It composes with resolvers and inline rules; keep single-field rules in schemas and reserve `validate` for dependencies between fields.
- Also since 7.72, `formState` subscribes to submit state, so `isSubmitted`/`isSubmitting` drive UI without custom bookkeeping.
