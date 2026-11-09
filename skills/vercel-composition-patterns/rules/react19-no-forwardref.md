---
title: React 19 Ref as a Prop
impact: MEDIUM
impactDescription: plain function components that accept ref like any other prop
tags: react19, refs, context, hooks
---

## React 19 Ref as a Prop

In React 19, `ref` is a regular prop: declare it in the props type and pass it through. `useContext` is still supported; `use()` can read context conditionally when that is actually needed.

**Correct:**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />
}
```

**Context reads:**

`useContext(MyContext)` remains correct at the top level of a component. `use(MyContext)` can be called conditionally or inside a loop, which `useContext` cannot, so reach for `use()` only when that conditional read is the point.
