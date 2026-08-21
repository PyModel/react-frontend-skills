---
title: Choose Post-Submit Revalidation Deliberately
impact: CRITICAL
impactDescription: balances correction feedback against validation cost after a failed submit
tags: formcfg, revalidate-mode, re-renders, useForm
---

## Choose Post-Submit Revalidation Deliberately

After a failed submit, `reValidateMode` controls when fields with errors revalidate. The default `onChange` gives immediate confirmation as users correct errors. Choose `onBlur` when validation is expensive or errors should settle after field completion; this is a UX trade-off, not a universal performance rule.

**Incorrect:** Treat `onBlur` as universally faster and better after every failed submit.

**Correct:** Choose `onChange` or `onBlur` from correction UX and measured validation cost.

**Immediate correction feedback (default):**

```typescript
const { register, handleSubmit } = useForm({
  mode: 'onSubmit',
  reValidateMode: 'onChange',  // Default: after first submit, validates on EVERY keystroke
})

function PaymentForm() {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('cardNumber', { required: true })} />
      <input {...register('cvv', { required: true, maxLength: 4 })} />
    </form>
  )
}
```

**Deferred correction feedback:**

```typescript
const { register, handleSubmit } = useForm({
  mode: 'onSubmit',
  reValidateMode: 'onBlur',  // After first submit, validates only on blur
})

function PaymentForm() {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('cardNumber', { required: true })} />
      <input {...register('cvv', { required: true, maxLength: 4 })} />
    </form>
  )
}
```

Reference: [useForm - reValidateMode](https://react-hook-form.com/docs/useform)
