---
title: React 19 Ref as a Prop
impact: MEDIUM
impactDescription: cleaner component definitions without the forwardRef wrapper
tags: react19, refs, context, hooks
---

## React 19 Ref as a Prop

> **⚠️ React 19+ only.** Skip this if you're on React 18 or earlier.

In React 19, `ref` is a regular prop, so a function component accepts it without the `forwardRef` wrapper. `useContext` is still supported; `use()` can read context conditionally when that is actually needed.

**Incorrect (forwardRef in React 19):**

```tsx
const ComposerInput = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />
})
```

**Correct (ref as a regular prop):**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />
}
```

**Context reads:**

`useContext(MyContext)` remains correct at the top level of a component. `use(MyContext)` can be called conditionally or inside a loop, which `useContext` cannot, so reach for `use()` only when that conditional read is the point.
