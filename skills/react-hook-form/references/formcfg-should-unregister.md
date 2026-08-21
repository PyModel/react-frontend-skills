---
title: Choose shouldUnregister from Submission Semantics
impact: HIGH
impactDescription: reduces memory usage for forms with frequently mounted/unmounted fields
tags: formcfg, should-unregister, dynamic-forms, memory
---

## Choose shouldUnregister from Submission Semantics

By default, unmounted fields retain their values and remain in the submitted form data. Set `shouldUnregister: true` only when an unmounted input should behave like a native form control and disappear from submission. This changes data semantics; it is not merely a memory optimization.

**Incorrect (unmounted fields persist in memory):**

```typescript
const { register, handleSubmit } = useForm({
  shouldUnregister: false,  // Default: unmounted fields stay in form state
})

function MultiStepForm() {
  const [step, setStep] = useState(1)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {step === 1 && (
        <input {...register('personalInfo.name')} />
      )}
      {step === 2 && (
        <input {...register('companyInfo.company')} />  {/* Step 1 fields still in memory */}
      )}
    </form>
  )
}
```

**Correct (unmounted fields cleaned up automatically):**

```typescript
const { register, handleSubmit } = useForm({
  shouldUnregister: true,  // Unmounted fields are omitted from submission
})

function MultiStepForm() {
  const [step, setStep] = useState(1)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {step === 1 && (
        <input {...register('personalInfo.name')} />
      )}
      {step === 2 && (
        <input {...register('companyInfo.company')} />  {/* Step 1 fields cleaned up */}
      )}
    </form>
  )
}
```

**When NOT to use:**
- Multi-step wizards where you need to preserve values across steps
- Conditional fields that should retain values when hidden

With `useFieldArray`/`Controller`, avoid `shouldUnregister` when reorder or remount behavior would discard values unexpectedly. Test conditional-field, reset, and default-value flows.

Reference: [useForm - shouldUnregister](https://react-hook-form.com/docs/useform)
