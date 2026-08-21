---
title: Memoize FormProvider Children Only After Profiling
impact: LOW
impactDescription: prevents cascade re-renders from FormProvider state updates
tags: adv, FormProvider, memo, optimization
---

## Memoize FormProvider Children Only After Profiling

`FormProvider` exposes form methods through context. `React.memo` can skip parent-prop re-renders, but it does not block updates for context values a child consumes. Subscribe as deep and narrowly as possible with `useWatch`, `useFormState({ name, exact })`, or `useController`; add memoization only after profiling.

**Incorrect (children re-render on any form state change):**

```typescript
function LargeForm() {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PersonalInfoSection />  {/* Re-renders on ANY form state change */}
        <AddressSection />  {/* Re-renders on ANY form state change */}
        <PaymentSection />  {/* Re-renders on ANY form state change */}
      </form>
    </FormProvider>
  )
}

function PersonalInfoSection() {
  const { register } = useFormContext()
  return (
    <div>
      <input {...register('firstName')} />
      <input {...register('lastName')} />
    </div>
  )
}
```

**Correct (memo prevents unnecessary child re-renders):**

```typescript
function LargeForm() {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PersonalInfoSection />
        <AddressSection />
        <PaymentSection />
      </form>
    </FormProvider>
  )
}

const PersonalInfoSection = memo(function PersonalInfoSection() {
  const { register } = useFormContext()
  return (
    <div>
      <input {...register('firstName')} />
      <input {...register('lastName')} />
    </div>
  )
})

const AddressSection = memo(function AddressSection() {
  const { register } = useFormContext()
  return (
    <div>
      <input {...register('address.street')} />
      <input {...register('address.city')} />
    </div>
  )
})
```

Reference: [React Hook Form - Advanced Usage](https://react-hook-form.com/advanced-usage)
