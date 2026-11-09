---
title: Build shadcn Fields with Controller and Field
impact: MEDIUM
impactDescription: prevents broken error display and missing accessibility attributes when wiring shadcn inputs to React Hook Form
tags: integ, shadcn, controller, field, accessibility
---

## Build shadcn Fields with Controller and Field

shadcn/ui forms use React Hook Form's own `Controller` with shadcn's `Field`, `FieldLabel` and `FieldError` from `@/components/ui/field`. Take `useForm`, `Controller` and the resolver from their own packages, and the layout components from shadcn. Put `data-invalid` on `Field` and `aria-invalid` on the control so styling and assistive tech see the error.

**Incorrect (no error state wiring):**

```typescript
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const form = useForm({ defaultValues: { email: '' } })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Email</FieldLabel>  {/* not linked to the input */}
            <Input {...field} />            {/* error never shown or announced */}
          </Field>
        )}
      />
    </form>
  )
}
```

**Correct (Controller + Field with invalid state):**

```typescript
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const form = useForm({ defaultValues: { email: '' } })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
```

Reference: [shadcn - React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form)
