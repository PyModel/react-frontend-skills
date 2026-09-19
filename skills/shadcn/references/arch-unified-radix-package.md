---
title: Import Primitives from the Unified radix-ui Package
impact: LOW-MEDIUM
impactDescription: one import source instead of dozens of @radix-ui packages
tags: shadcn, radix, imports, dependencies
---

## Import Primitives from the Unified radix-ui Package

Since February 2026, Radix UI ships as one unified `radix-ui` package. Generated shadcn components increasingly import primitives from `radix-ui` instead of individual `@radix-ui/react-*` packages; mixing both styles in one codebase doubles the dependency tree and risks version drift between the two sources of the same primitive.

**Incorrect (mixed import sources):**

```tsx
// Old-style per-primitive package, still valid but legacy...
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

**Migrating a component:**

```bash
# Let the CLI rewrite imports when upgrading a component
npx shadcn@latest add dialog --overwrite
npm uninstall @radix-ui/react-dialog
```

**Notes:**

- The unified package is a re-export of the same primitives — behavior, ARIA attributes, and composition APIs (`asChild`) are unchanged.
- Do not blindly remove `@radix-ui/react-*` packages until no checked-in file imports them: `grep -r "@radix-ui" components/` first.
- Base UI-based components (the current default) import from `base-ui`/`@base-ui-components/react` instead; keep the two primitive sources clearly separated per component.
