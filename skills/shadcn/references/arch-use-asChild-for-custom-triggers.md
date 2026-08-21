---
title: Use the Generated Primitive's Composition API
impact: CRITICAL
impactDescription: avoids nested interactive elements while preserving primitive behavior
tags: arch, radix, base-ui, asChild, render, composition, triggers
---

## Use the Generated Primitive's Composition API

Current shadcn projects can be generated for Radix UI or Base UI. Inspect the checked-in component implementation or project configuration before composing a custom trigger:

- Radix variants commonly use `asChild`.
- Base UI variants commonly use a `render` element prop.

Do not mix the two APIs.

**Incorrect (nested interactive elements):**

```tsx
<DropdownMenuTrigger>
  <Button variant="ghost">Account</Button>
</DropdownMenuTrigger>
```

If both components render `<button>`, this creates invalid nested interactive content.

**Correct (use the generated primitive's composition API):**

**Radix-generated component:**

```tsx
<DropdownMenuTrigger asChild>
  <Button variant="ghost">Account</Button>
</DropdownMenuTrigger>
```

**Base UI-generated component:**

```tsx
<DropdownMenuTrigger render={<Button variant="ghost" />}>
  Account
</DropdownMenuTrigger>
```

The custom component must forward the props and ref required by the underlying primitive. Verify the rendered element, keyboard behavior, accessible name, focus restoration, and event composition after wrapping it.

References:
- [shadcn Radix dropdown menu](https://ui.shadcn.com/docs/components/radix/dropdown-menu)
- [shadcn Base UI dropdown menu](https://ui.shadcn.com/docs/components/base/dropdown-menu)
