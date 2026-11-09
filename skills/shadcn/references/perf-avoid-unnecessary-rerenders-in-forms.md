---
title: Avoid Unnecessary Re-renders in Forms
impact: MEDIUM
impactDescription: prevents full form re-render on every keystroke
tags: perf, forms, re-renders, react-hook-form, isolation
---

## Avoid Unnecessary Re-renders in Forms

Isolate frequently updating form state to prevent entire form re-renders. Watch specific fields instead of the entire form state. Each `Controller` already re-renders only its own field, so keep reactive reads out of the component that owns the form.

**Incorrect (watching entire form state):**

```tsx
function CheckoutForm() {
  const form = useForm<CheckoutFormValues>()
  const values = form.watch() // Re-renders entire form on ANY field change

  const total = calculateTotal(values.items, values.coupon)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* All 20 form fields re-render on every keystroke */}
        <Controller name="name" control={form.control} render={...} />
        <Controller name="email" control={form.control} render={...} />
        <Controller name="address" control={form.control} render={...} />
        {/* ... 17 more fields */}
        <div>Total: ${total}</div>
      </FieldGroup>
    </form>
  )
}
```

**Correct (isolated watch with useWatch):**

```tsx
import { Controller, useForm, useWatch, type Control } from "react-hook-form"
import { FieldGroup } from "@/components/ui/field"

function CheckoutForm() {
  const form = useForm<CheckoutFormValues>()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller name="name" control={form.control} render={...} />
        <Controller name="email" control={form.control} render={...} />
        <Controller name="address" control={form.control} render={...} />
        {/* Fields don't re-render when unrelated fields change */}

        {/* Isolated component for reactive total */}
        <OrderTotal control={form.control} />
      </FieldGroup>
    </form>
  )
}

function OrderTotal({ control }: { control: Control<CheckoutFormValues> }) {
  // Only this component re-renders when items or coupon change
  const [items, coupon] = useWatch({ control, name: ["items", "coupon"] })

  const total = calculateTotal(items, coupon)

  return <div className="text-lg font-bold">Total: ${total}</div>
}
```

**Alternative (watch specific fields at form level):**

```tsx
function CheckoutForm() {
  const form = useForm<CheckoutFormValues>()

  // Only watch specific fields needed for calculations
  const [items, coupon] = form.watch(["items", "coupon"])
  // Still re-renders the form component, but only when these 2 fields change

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  )
}
```

**Best practices:**
- Use `useWatch` in isolated child components
- Watch specific field names, not entire form
- Use `useFormState` for submission/validation state
- Render each field through `Controller` (or `useController` in a field component) so it subscribes to its own state only

Reference: [React Hook Form useWatch](https://react-hook-form.com/docs/usewatch)
