---
title: Handle Async Validation with Debouncing
impact: HIGH
impactDescription: prevents excessive API calls during validation
tags: form, async, validation, debounce, api
---

## Handle Async Validation with Debouncing

When validating against an API (username availability, email uniqueness), debounce the validation to prevent excessive network requests. Surface the result through `form.setError` so the field's `FieldError` shows it. `handleSubmit` replaces `formState.errors` with the resolver result, so a manual error is cleared on submit: re-run the check inside `onSubmit` and set the error again there. The debounced check is early feedback only.

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
import { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDebouncedCallback } from "use-debounce"
import { Loader2 } from "lucide-react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const baseSchema = z.object({
  username: z.string().min(3, { error: "Username must be at least 3 characters" }),
})

type FormValues = z.infer<typeof baseSchema>

async function isUsernameAvailable(username: string) {
  const response = await fetch(`/api/check-username?u=${encodeURIComponent(username)}`)
  return response.ok
}

const takenError = { type: "server", message: "Username already taken" } as const

function UsernameForm() {
  const [isChecking, setIsChecking] = useState(false)
  const latest = useRef("")

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { username: "" },
    mode: "onBlur",
  })

  // Early feedback only: submit re-checks below.
  const checkUsername = useDebouncedCallback(async (username: string) => {
    if (username.length < 3) return

    setIsChecking(true)
    try {
      const available = await isUsernameAvailable(username)
      // Stale-response guard: ignore a result for a value no longer in the input.
      if (username !== latest.current) return
      if (available) form.clearErrors("username")
      else form.setError("username", takenError)
    } finally {
      setIsChecking(false)
    }
  }, 500) // 500ms debounce

  async function onSubmit(values: FormValues) {
    // handleSubmit wipes manual errors, so check again here.
    if (!(await isUsernameAvailable(values.username))) {
      form.setError("username", takenError)
      return
    }
    await fetch("/api/users", { method: "POST", body: JSON.stringify(values) })
  }

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
                  latest.current = e.target.value
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
