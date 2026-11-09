---
title: Preserve the Primitive's Compound Structure
impact: CRITICAL
impactDescription: maintains keyboard navigation and focus management
tags: arch, radix, base-ui, primitives, compound-components, structure
---

## Preserve the Primitive's Compound Structure

shadcn/ui components wrap Radix or Base UI primitives with specific parent-child relationships. Breaking this structure disables keyboard navigation, focus trapping, and ARIA attributes.

**Incorrect (broken primitive hierarchy):**

```tsx
function CustomDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <div className="fixed inset-0 bg-black/50">
          <DialogContent>
            {/* DialogContent outside Dialog - focus trap broken */}
            {children}
          </DialogContent>
        </div>
      )}
    </>
  )
}
```

**Correct (preserved compound component structure):**

```tsx
function CustomDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        {/* Proper hierarchy: Dialog > DialogContent */}
        {children}
      </DialogContent>
    </Dialog>
  )
}
```

**Required hierarchies for common components:**
- `Dialog` → `DialogTrigger` + `DialogContent` → `DialogHeader/Footer`
- `DropdownMenu` → `DropdownMenuTrigger` + `DropdownMenuContent` → `DropdownMenuItem`
- `Tabs` → `TabsList` → `TabsTrigger` + `TabsContent`

Reference: [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
