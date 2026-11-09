---
title: Preserve the Primitive's ARIA Attributes
impact: CRITICAL
impactDescription: maintains screen reader compatibility
tags: ally, aria, radix, base-ui, screen-readers, accessibility
---

## Preserve the Primitive's ARIA Attributes

Radix and Base UI primitives manage ARIA attributes for accessibility. Overriding or omitting these attributes breaks screen reader functionality.

**Incorrect (ARIA attributes overridden):**

```tsx
function CustomAccordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            {/* Missing aria-expanded, aria-controls */}
            {item.title}
          </button>
          {openIndex === index && (
            <div>
              {/* Missing aria-labelledby, role="region" */}
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

**Correct (Radix-generated wrapper; a Base UI wrapper manages the same ARIA through its own props):**

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem as AccordionItemComponent,
  AccordionTrigger,
} from "@/components/ui/accordion"

function CustomAccordion({ items }: { items: AccordionItem[] }) {
  return (
    <Accordion type="single" collapsible>
      {items.map((item) => (
        <AccordionItemComponent key={item.id} value={item.id}>
          <AccordionTrigger>
            {/* The primitive adds aria-expanded and aria-controls */}
            {item.title}
          </AccordionTrigger>
          <AccordionContent>
            {/* The primitive adds aria-labelledby and role="region" */}
            {item.content}
          </AccordionContent>
        </AccordionItemComponent>
      ))}
    </Accordion>
  )
}
```

**ARIA attributes managed by the primitive:**
- `aria-expanded` on triggers (Accordion, Collapsible, Dialog)
- `aria-controls` / `aria-labelledby` for content relationships
- `role` attributes (dialog, menu, tablist, etc.)
- `aria-selected` / `aria-checked` for selection states

Reference: [Radix Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) · [Base UI Accessibility](https://base-ui.com/react/overview/accessibility)
