---
title: Provide defaultValue to useWatch for Initial Render
impact: MEDIUM-HIGH
impactDescription: prevents undefined flash on initial render
tags: sub, useWatch, default-value, hydration
---

## Provide defaultValue to useWatch for Initial Render

On the initial render, `useWatch` returns the current form value when one is already registered; `defaultValue` (or `useForm({ defaultValues })`) is the fallback before the form has mounted. Provide one source of defaults consistently so controlled UI does not begin as `undefined`.

**Incorrect (undefined on first render):**

```typescript
function PriceDisplay({ control }: { control: Control<OrderForm> }) {
  const quantity = useWatch({ control, name: 'quantity' })

  return (
    <div>
      {quantity !== undefined ? (  // Undefined check required
        <span>Quantity: {quantity}</span>
      ) : (
        <span>Loading...</span>  // Flash of loading state
      )}
    </div>
  )
}
```

**Correct (defaultValue prevents undefined):**

```typescript
function PriceDisplay({ control }: { control: Control<OrderForm> }) {
  const quantity = useWatch({
    control,
    name: 'quantity',
    defaultValue: 1,  // Immediate value, no undefined check needed
  })

  return (
    <div>
      <span>Quantity: {quantity}</span>
    </div>
  )
}
```

**Note:** defaultValue should match the type expected by your form schema to maintain type safety.

Reference: [useWatch](https://react-hook-form.com/docs/usewatch)
