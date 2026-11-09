---
title: Import Primitives from the Unified radix-ui Package
impact: LOW-MEDIUM
impactDescription: one import source instead of dozens of @radix-ui packages
tags: shadcn, radix, imports, dependencies
---

## Import Primitives from the Unified radix-ui Package

Radix UI ships as one unified `radix-ui` package, and generated shadcn components import primitives from it. Import every Radix primitive from `radix-ui`; mixing it with individual `@radix-ui/react-*` packages doubles the dependency tree and risks version drift between two sources of the same primitive.

**Incorrect (mixed import sources):**

```tsx
// Per-primitive package...
import * as DialogPrimitive from '@radix-ui/react-dialog'
// ...next to the unified package for another component
import { Tooltip } from 'radix-ui'
// Two dependency trees for the same primitives
```

**Correct (single unified package):**

```tsx
import { Dialog, Tooltip } from 'radix-ui'

export const DialogRoot = Dialog.Root
export const DialogTrigger = Dialog.Trigger
export const DialogContent = Dialog.Content
```

**Adding a component:**

```bash
# The CLI generates components with the unified import
npx shadcn@latest add dialog
```

**Notes:**

- The unified package is a re-export of the same primitives — behavior, ARIA attributes, and composition APIs (`asChild`) are unchanged.
- Base UI-based components (the current default) import from `@base-ui/react` instead; keep the two primitive sources clearly separated per component.
