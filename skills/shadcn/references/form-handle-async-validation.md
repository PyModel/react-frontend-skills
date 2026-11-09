---
title: Handle Async Validation with Debouncing
impact: HIGH
impactDescription: prevents excessive API calls during validation
tags: form, async, validation, debounce, api
---

## Handle Async Validation with Debouncing

When validating against an API (username availability, email uniqueness), debounce the validation to prevent excessive network requests. Surface the result through `form.setError` so the field's `FieldError` shows it.

**Incorrect (API call on every keystroke):**

```tsx
const schema = z.object({
  username: z.string().min(3).refine(
    async (username) => {
      // Called on EVERY keystroke - floods server
      const response = await fetch(`/api/check-username?u=${username}`)
      return response.ok
    },
    { error: "Username already taken" }
  ),
})

function UsernameForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange", // Triggers validation constantly
  })

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}
```

**Correct (debounced async validation):**

```tsx
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebouncedCallback } from "use-debounce"
import { Loader2 } from "lucide-react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const baseSchema = z.object({
  username: z.string().min(3, { error: "Username must be at least 3 characters" }),
})

type FormValues = z.infer<typeof baseSchema>

function UsernameForm() {
  const [isChecking, setIsChecking] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { username: "" },
    mode: "onBlur",
  })

  const checkUsername = useDebouncedCallback(async (username: string) => {
    if (username.length < 3) return

    setIsChecking(true)
    try {
      const response = await fetch(`/api/check-username?u=${username}`)
      if (!response.ok) {
        form.setError("username", { message: "Username already taken" })
      } else {
        form.clearErrors("username")
      }
    } finally {
      setIsChecking(false)
    }
  }, 500) // 500ms debounce

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="username"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Username</FieldLabel>
            <div className="relative">
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  field.onChange(e)
                  checkUsername(e.target.value)
                }}
              />
              {isChecking && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
              )}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  )
}
```

Reference: [use-debounce](https://github.com/xnimorz/use-debounce)
