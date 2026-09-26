---
title: Mark Fields Touched When Triggering Validation
impact: MEDIUM
impactDescription: trigger() alone validates without touching, so errors gated on isTouched stay hidden; shouldTouch (7.87+) fixes that without setValue workarounds
tags: valid, trigger, touched, wizard, multi-step
---

## Mark Fields Touched When Triggering Validation

Multi-step forms call `trigger()` before moving to the next step. By default, `trigger()` validates but leaves the fields untouched. Any UI that only shows errors once a field `isTouched` then hides the errors that are blocking the user. Since 7.87, `trigger(names, { shouldTouch: true })` marks the fields as touched, whatever the validation result.

**Incorrect (errors stay hidden, or touched state is faked with setValue):**

```typescript
async function goToNextStep() {
  const valid = await trigger(['firstName', 'lastName'])
  // Untouched fields: errors gated on isTouched are not shown
  if (valid) setStep(2)
}

// Workaround: rewrites values just to flip touched state
setValue('firstName', getValues('firstName'), { shouldTouch: true, shouldValidate: true })
```

**Correct (validate and touch in one call):**

```typescript
const { register, trigger } = useForm<{ firstName: string; lastName: string; plan: string }>()

async function goToNextStep() {
  const valid = await trigger(['firstName', 'lastName'], { shouldTouch: true })
  if (valid) setStep(2)
}

// Validate and touch every registered field, e.g. on a final review step:
await trigger(undefined, { shouldTouch: true })
```

`shouldFocus: true` can be combined with it to move focus to the first invalid field.

**When NOT to use this pattern:**
- Validating in the background, for example to enable a button, where the user has not acted on those fields yet: marking them touched would show errors too early

Reference: [useForm - trigger](https://react-hook-form.com/docs/useform/trigger) · [v7.87.0 release](https://github.com/react-hook-form/react-hook-form/releases/tag/v7.87.0)
