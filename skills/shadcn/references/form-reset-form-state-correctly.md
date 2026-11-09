---
title: Reset Form State Correctly After Submission
impact: HIGH
impactDescription: prevents stale data and submission errors
tags: form, reset, state, react-hook-form, submission
---

## Reset Form State Correctly After Submission

After successful form submission, reset the form state to prevent stale data, duplicate submissions, and confusion about form status. Controlled `Controller` fields need complete `defaultValues` so `reset()` returns them to a defined value.

**Incorrect (form not reset after submission):**

```tsx
function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormValues) => {
    await submitContact(data)
    toast.success("Message sent!")
    // Form still shows old data
    // User might accidentally resubmit
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}
```

**Correct (form reset with proper state management):**

```tsx
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await submitContact(data)
      toast.success("Message sent!")
      form.reset() // Resets to defaultValues and clears errors
    } catch (error) {
      toast.error("Failed to send message")
      // Keep form data so user can retry
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* email and message follow the same Controller + Field shape */}
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Clear
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
```

**Reset patterns:**
- `form.reset()` - Reset to defaultValues
- `form.reset(newValues)` - Reset to specific values
- `form.resetField("email")` - Reset single field
- `form.clearErrors()` - Clear errors without resetting values

**For edit forms (reset to fetched data):**

```tsx
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
})

const form = useForm<UserFormValues>({
  resolver: zodResolver(userSchema),
  defaultValues: { name: "", email: "" },
})
const { reset } = form

useEffect(() => {
  if (user) reset(user)
}, [user, reset])
```

Reference: [React Hook Form reset](https://react-hook-form.com/docs/useform/reset)
