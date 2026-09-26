---
title: Render Field Errors with ErrorMessage or Optional Chaining
impact: MEDIUM-HIGH
impactDescription: prevents runtime errors from undefined nested properties
tags: valid, errors, optional-chaining, nested-fields
---

## Render Field Errors with ErrorMessage or Optional Chaining

Error objects can have deeply nested paths for nested fields. Since 7.88, React Hook Form ships an `<ErrorMessage>` component that looks up the path for you and re-renders only when that field's error changes. Otherwise use optional chaining to read errors safely.

**Incorrect (direct access throws on undefined):**

```typescript
function AddressForm() {
  const { register, formState: { errors } } = useForm()

  return (
    <form>
      <input {...register('address.street', { required: true })} />
      <span>{errors.address.street.message}</span>  {/* Throws if address undefined */}

      <input {...register('address.city', { required: true })} />
      <span>{errors.address.city.message}</span>  {/* Throws if address undefined */}
    </form>
  )
}
```

**Correct (optional chaining for safe access):**

```typescript
function AddressForm() {
  const { register, formState: { errors } } = useForm()

  return (
    <form>
      <input {...register('address.street', { required: true })} />
      <span>{errors.address?.street?.message}</span>  {/* Safe access */}

      <input {...register('address.city', { required: true })} />
      <span>{errors.address?.city?.message}</span>  {/* Safe access */}
    </form>
  )
}
```

**Correct (built-in ErrorMessage, 7.88+):**

```typescript
import { useForm, ErrorMessage } from 'react-hook-form'

type Address = { address: { street: string; city: string } }

function AddressForm() {
  const { register, control } = useForm<Address>()

  return (
    <form>
      <input
        {...register('address.street', { required: 'Street is required' })}
        aria-describedby="street-error"
      />
      {/* Subscribes to this field's error only; renders nothing when there is none */}
      <ErrorMessage
        control={control}
        name="address.street"
        render={({ message }) => <p id="street-error" role="alert">{message}</p>}
      />
    </form>
  )
}
```

Notes on the built-in component:
- It reads `control` or the nearest `FormProvider`. Without either, it throws.
- It has no `errors` prop and does not forward extra props through `as`. Set `id`, `role` or `className` inside `render`.
- `render` also receives `messages` (all errors for the field) when the form uses `criteriaMode: 'all'`.
- `name` also accepts `'root'` and `'root.serverError'` for form-level errors.
- The older `@hookform/error-message` package still works, but the built-in component needs no extra dependency. For a lookup by path in plain code, `react-hook-form` exports `get`, so lodash is not needed.

Reference: [React Hook Form - ErrorMessage](https://react-hook-form.com/docs/useformstate/errormessage) · [Advanced Usage](https://react-hook-form.com/advanced-usage)
