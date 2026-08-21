---
title: Align Submit Gating with Validation Mode
impact: MEDIUM
impactDescription: avoids contradictory submit UX and unnecessary live validity subscriptions
tags: formstate, isValid, onSubmit, validation-mode, accessibility
---

## Align Submit Gating with Validation Mode

`formState.isValid` is derived from the form's validation result. In an `onSubmit` form, using it to disable the submit button before users can submit often conflicts with submit-time validation and can hide how to resolve errors. Subscribing to `formState.isValid` also makes React Hook Form run a full-form validation on mount and on every value change, even with `mode: 'onSubmit'` (v7.39.0+). With an expensive resolver that is real work you did not ask for.

**Incorrect (gate an `onSubmit` form on live validity):**

```tsx
const {
  handleSubmit,
  formState: { isValid },
} = useForm({ mode: 'onSubmit' })

return <button disabled={!isValid}>Submit</button>
```

**Correct (keep submit available and prevent duplicate submissions):**

For submit-time validation, keep the button available and prevent duplicate submissions with `isSubmitting`:

```tsx
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm({ mode: 'onSubmit' })

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('email', { required: 'Email is required' })} />
    {errors.email ? <p>{errors.email.message}</p> : null}
    <button disabled={isSubmitting}>
      {isSubmitting ? 'Submitting…' : 'Submit'}
    </button>
  </form>
)
```

If the product deliberately prevents submission until valid, choose a live validation mode and subscribe to `isValid` explicitly:

```tsx
const {
  formState: { isValid, isSubmitting },
} = useForm({ mode: 'onChange' })

<button disabled={!isValid || isSubmitting}>Submit</button>
```

Ensure disabled-state styling, error messaging, and assistive text explain what remains invalid. Do not use a disabled submit button as the only error-discovery mechanism.

Reference: [React Hook Form formState](https://react-hook-form.com/docs/useform/formstate)
