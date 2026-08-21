---
title: Split Controlled Fields When Isolation Helps
impact: MEDIUM-HIGH
impactDescription: improves field ownership and re-render isolation where useful
tags: ctrl, useController, component-design, separation
---

## Split Controlled Fields When Isolation Helps

React Hook Form permits multiple `useController` calls in one component, and their returned objects do not collide when named clearly. Split fields into dedicated components when it improves ownership, reuse, or re-render isolation; do not enforce one hook per component mechanically.

**Incorrect:** Require exactly one `useController` call per component regardless of field coupling or component ownership.

**Correct:** Split controlled fields when isolation, reuse, or clearer ownership justifies the extra component boundary.

**Valid but coupled (both fields re-render together):**

```typescript
function DateRangeInput({ control }: { control: Control<FormData> }) {
  const startField = useController({ name: 'startDate', control })
  const endField = useController({ name: 'endDate', control })

  return (
    <div>
      <DatePicker
        value={startField.field.value}
        onChange={startField.field.onChange}
        error={startField.fieldState.error?.message}
      />
      <DatePicker
        value={endField.field.value}
        onChange={endField.field.onChange}
        error={endField.fieldState.error?.message}
      />
    </div>
  )
}
```

**Isolated reusable fields:**

```typescript
function DateRangeInput({ control }: { control: Control<FormData> }) {
  return (
    <div>
      <DateInput control={control} name="startDate" label="Start Date" />
      <DateInput control={control} name="endDate" label="End Date" />
    </div>
  )
}

function DateInput({ control, name, label }: DateInputProps) {
  const { field, fieldState } = useController({ name, control })

  return (
    <DatePicker
      label={label}
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  )
}
```

Reference: [useController](https://react-hook-form.com/docs/usecontroller)
