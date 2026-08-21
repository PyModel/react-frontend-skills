---
title: Choose Validation Mode from UX and Validation Cost
impact: CRITICAL
impactDescription: prevents re-renders on every keystroke
tags: formcfg, validation-mode, re-renders, useForm
---

## Choose Validation Mode from UX and Validation Cost

The `mode` option controls when React Hook Form validates before the first submit. `onSubmit` is the default and minimizes validation work, but `onBlur`, `onTouched`, or `onChange` may better match the product's feedback requirements. Do not label a supported mode incorrect without measuring an expensive form.

**Incorrect:** Ban `onChange` validation solely because it can re-render more often.

**Correct:** Select the validation mode from the required feedback timing and actual resolver cost.

**Live validation (use when the UX requires it):**

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  mode: 'onChange',  // Triggers validation + re-render on EVERY input change
})

function RegistrationForm() {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}
```

**Submit-time validation (default):**

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  mode: 'onSubmit',  // Default: validates only when form is submitted
})

function RegistrationForm() {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}
```

**When to use other modes:**
- `onBlur`: Validate when user leaves a field (good balance of UX and performance)
- `onTouched`: Like `onBlur` but only after first interaction
- `onChange`: Use for immediate feedback when resolver cost and error UX are acceptable

Reference: [useForm - mode](https://react-hook-form.com/docs/useform)
