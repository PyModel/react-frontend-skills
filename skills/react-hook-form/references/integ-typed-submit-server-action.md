---
title: Submit with a Typed handleSubmit Result or Action
impact: MEDIUM-HIGH
impactDescription: typed submit results and direct Server Action wiring
tags: react-hook-form, submit, server-actions, integration, typescript
---

## Submit with a Typed handleSubmit Result or Action

Since RHF 7.84, `handleSubmit` returns the typed result of the `onValid` callback instead of discarding it, and the `action` option accepts a function (Server Action style) in addition to a URL string. Together they remove boilerplate between form validation and server mutation.

**Incorrect (throwing away the submit result):**

```tsx
const onSubmit = async (values: SignupValues) => {
  const user = await createUser(values)
  return user // result is swallowed by handleSubmit
}

// Handler must re-plumb state to reach the created user
<form onSubmit={form.handleSubmit(onSubmit)} />
```

**Correct (typed result flows through handleSubmit):**

```tsx
const onSubmit = async (values: SignupValues): Promise<User> => {
  return createUser(values)
}

const submitted = form.handleSubmit(onSubmit)
const user: User = await submitted // typed as User
```

**Correct (function-based action for Server Actions):**

```tsx
const form = useForm<SignupValues>({
  action: async (values) => {
    'use server'
    return createUser(values) // runs the same validation + submission path
  },
})
// Progressive enhancement friendly: works even before hydration,
// like the classic URL-string action but with RHF's data contract
```

**Notes:**

- The function `action` receives validated values and runs alongside (not instead of) RHF's validation pipeline; URL-string `action` remains supported for native form posts.
- Pair with `useFormState`'s `isSubmitting`/`isSubmitSuccessful` for pending UI; Server Action results surface through the same state.
- v8 note: RHF v8 is in beta (breaking: `Controller`/custom register passes the input ref instead of a partial object) — stay on the 7.8x line for production until v8 is stable.
