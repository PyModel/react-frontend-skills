---
title: Use getFieldState and getErrors for Single-Field Reads
impact: MEDIUM
impactDescription: avoids whole-form subscriptions for single-field reads and re-renders for reads in handlers
tags: formstate, getFieldState, getErrors, single-field, subscription
---

## Use getFieldState and getErrors for Single-Field Reads

When you need a single field's state (dirty, touched, error), use `getFieldState()` instead of subscribing to whole-form state. When it is called with `formState` during render, it subscribes only to what it reads. Called without `formState`, or with `getErrors()` (7.86+) inside event handlers, it reads the current value with no subscription at all.

**Incorrect (useFormState creates subscription for one-time check):**

```typescript
function FieldHelpText({ control, name }: { control: Control; name: string }) {
  const { touchedFields } = useFormState({ control })  // Subscribes to all touched changes

  const wasTouched = touchedFields[name]

  return wasTouched ? null : <span>Please fill out this field</span>
}
```

**Correct (getFieldState for the field you render, getErrors in handlers):**

```typescript
function SignupForm() {
  const { register, getFieldState, getErrors, formState } = useForm<{ email: string }>()

  // Render-time read: passing formState keeps it reactive, but it subscribes
  // only to the state this call reads, not to every touched field
  const { isTouched } = getFieldState('email', formState)

  function handleEmailBlur() {
    // Point-in-time read (7.86+): no validation, no subscription, no re-render
    const error = getErrors('email')
    if (error) analytics.track('email_invalid', { type: error.type })
  }

  return (
    <form>
      <input {...register('email', { required: 'Email is required', onBlur: handleEmailBlur })} />
      {isTouched ? null : <span>Please fill out this field</span>}
    </form>
  )
}
```

**When to use each:**
- `useFormState`: a child component needs to re-render when form state changes
- `getFieldState(name, formState)`: render one field's state reactively
- `getFieldState(name)` or `getErrors(name)`: read the current value inside handlers or effects without re-rendering. `getErrors()` returns all errors, and `getErrors(['a', 'b'])` returns a tuple.

Reference: [useForm - getFieldState](https://react-hook-form.com/docs/useform/getfieldstate) · [useForm - getErrors](https://react-hook-form.com/docs/useform/geterrors)
