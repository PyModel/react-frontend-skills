---
title: Use Zod for Schema Validation
impact: HIGH
impactDescription: eliminates runtime type errors with full TS inference
tags: form, zod, validation, typescript, schema
---

## Use Zod for Schema Validation

Define form schemas with Zod 4 for type-safe validation. Zod integrates with React Hook Form via `@hookform/resolvers` and provides TypeScript type inference. Render each field with `Controller` and shadcn's `Field` components so schema errors reach the UI.

**Incorrect (manual validation without schema):**

```tsx
function RegistrationForm() {
  const form = useForm()

  const onSubmit = (data: any) => {
    // Manual validation - no type safety
    if (!data.email || !data.email.includes("@")) {
      form.setError("email", { message: "Invalid email" })
      return
    }
    if (!data.age || data.age < 18) {
      form.setError("age", { message: "Must be 18 or older" })
      return
    }
    // data is typed as 'any' - no autocomplete
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}
```

**Correct (Zod schema with type inference):**

```tsx
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const registrationSchema = z.object({
  // Top-level format validators: z.email(), z.url()
  email: z.email({ error: "Please enter a valid email" }),
  username: z
    .string()
    .min(3, { error: "Username must be at least 3 characters" })
    .max(20, { error: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { error: "Only letters, numbers, and underscores" }),
  age: z.coerce
    .number<string>({ error: "Enter your age" })
    .min(18, { error: "You must be at least 18 years old" })
    .max(120, { error: "Please enter a valid age" }),
  website: z.url({ error: "Please enter a valid URL" }).optional().or(z.literal("")),
})

type RegistrationInput = z.input<typeof registrationSchema>
type RegistrationValues = z.output<typeof registrationSchema>
// Output: { email: string; username: string; age: number; website?: string }

function RegistrationForm() {
  const form = useForm<RegistrationInput, unknown, RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      username: "",
      age: "",
      website: "",
    },
  })

  const onSubmit = (data: RegistrationValues) => {
    // data is fully typed with validation passed
    console.log(data.age) // number, coerced from the input string
  }

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
        <Controller
          name="age"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Age</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* username and website follow the same Controller + Field shape */}
        <Button type="submit">Register</Button>
      </FieldGroup>
    </form>
  )
}
```

**Common Zod patterns:**
- `z.coerce.number()` - Converts string input to number
- `.optional().or(z.literal(""))` - Allow empty string for optional fields
- `.refine(fn, { error: "..." })` - Custom validation logic
- `.transform()` - Transform values after validation

Reference: [Zod Documentation](https://zod.dev/)
