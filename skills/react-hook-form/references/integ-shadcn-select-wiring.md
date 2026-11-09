---
title: Wire shadcn Select with onValueChange Instead of Spread
impact: MEDIUM
impactDescription: prevents 100% of silent select binding failures with Radix-based components
tags: integ, shadcn, select, radix
---

## Wire shadcn Select with onValueChange Instead of Spread

shadcn's Select (built on Radix) uses `onValueChange` instead of `onChange`. Spreading field props directly doesn't work. Wire `name`, `value` and `onValueChange` from `field` by hand, and put `id` and `aria-invalid` on the `SelectTrigger`.

**Incorrect (spread doesn't work with Radix Select):**

```typescript
<Controller
  name="country"
  control={control}
  render={({ field }) => (
    <Select {...field}>  {/* field.onChange expects an event; Radix passes the value */}
      <SelectTrigger>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
      </SelectContent>
    </Select>
  )}
/>
```

**Correct (wire props individually):**

```typescript
<Controller
  name="country"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="country">Country</FieldLabel>
      <Select
        name={field.name}
        value={field.value}
        onValueChange={field.onChange}  // Radix passes the value directly
      >
        <SelectTrigger id="country" aria-invalid={fieldState.invalid}>
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
        </SelectContent>
      </Select>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

Reference: [shadcn - React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form)
