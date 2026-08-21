---
title: Prefer Variant and Class Composition Over Important Overrides
impact: HIGH
impactDescription: preserves predictable customization while allowing documented escape hatches
tags: style, important, specificity, tailwind-v4, overrides
---

## Prefer Variant and Class Composition Over Important Overrides

Prefer component variants, CSS variables, and `cn()`/`tailwind-merge` ordering over `!important`. Tailwind v4 supports the important modifier, but it should be a targeted escape hatch for specificity you cannot otherwise control, not the default component API.

**Incorrect (locking every consumer out):**

```tsx
function BrandButton({ children }: { children: React.ReactNode }) {
  return (
    <Button className="bg-brand! text-white! hover:bg-brand/90!">
      {children}
    </Button>
  )
}
```

**Correct (composable defaults):**

```tsx
import { cn } from '@/lib/utils'

function BrandButton({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <Button
      className={cn(
        'bg-brand text-brand-foreground hover:bg-brand/90',
        className
      )}
    >
      {children}
    </Button>
  )
}
```

When an important override is necessary, document why and use Tailwind v4's trailing syntax (`bg-red-500!`). The old leading syntax (`!bg-red-500`) is deprecated.

If a class does not win as expected:

1. Confirm the component forwards `className` and places it last in `cn()`.
2. Confirm the conflicting utilities are understood by the installed `tailwind-merge` version.
3. Prefer a component variant or semantic token over increasing specificity.
4. Inspect portal/content elements separately; the class may be applied to the wrong primitive.

Reference: [Tailwind CSS important modifier](https://tailwindcss.com/docs/styling-with-utility-classes#using-the-important-modifier)
