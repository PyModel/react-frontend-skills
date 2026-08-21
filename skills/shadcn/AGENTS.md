# shadcn/ui

**Version 0.1.0**  
shadcn/ui Community  
August 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive best practices guide for shadcn/ui applications, designed for AI agents and LLMs. Contains 42 rules across 8 categories, prioritized by impact from critical (component architecture, accessibility preservation) to incremental (state management). Each rule includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific impact metrics to guide automated refactoring and code generation.

---

## Table of Contents

1. Component Architecture — **CRITICAL**
   - 1.1 [Extend Variants with Class Variance Authority](references/arch-extend-variants-with-cva.md) — CRITICAL (maintains type safety and design consistency)
   - 1.2 [Forward Refs for Composable Components](references/arch-forward-refs-for-composable-components.md) — CRITICAL (enables integration with form libraries and focus management)
   - 1.3 [Isolate Component Variants from Base Styles](references/arch-isolate-component-variants.md) — CRITICAL (prevents style bleeding and maintains component reusability)
   - 1.4 [Preserve Radix Primitive Structure](references/arch-preserve-radix-primitive-structure.md) — CRITICAL (maintains keyboard navigation and focus management)
   - 1.5 [Use the Generated Primitive's Composition API](references/arch-use-asChild-for-custom-triggers.md) — CRITICAL (preserves accessibility and event handling)
   - 1.6 [Use cn() for Safe Class Merging](references/arch-use-cn-for-class-merging.md) — CRITICAL (prevents Tailwind class conflicts)
2. Accessibility Preservation — **CRITICAL**
   - 2.1 [Ensure Color Contrast Meets WCAG Standards](references/ally-ensure-color-contrast.md) — CRITICAL (enables readability for low vision users)
   - 2.2 [Maintain Focus Management in Modals](references/ally-maintain-focus-management.md) — CRITICAL (keyboard users cannot navigate or escape without it)
   - 2.3 [Preserve ARIA Attributes from Radix Primitives](references/ally-preserve-aria-attributes.md) — CRITICAL (maintains screen reader compatibility)
   - 2.4 [Preserve Keyboard Navigation Patterns](references/ally-preserve-keyboard-navigation.md) — CRITICAL (enables non-mouse users to navigate components)
   - 2.5 [Provide Screen Reader Labels for Icon Buttons](references/ally-provide-sr-only-labels.md) — CRITICAL (enables navigation for visually impaired users)
3. Styling & Theming — **HIGH**
   - 3.1 [Apply Mobile-First Responsive Design](references/style-responsive-design-patterns.md) — HIGH (prevents mobile usability failures on mobile traffic)
   - 3.2 [Prefer Variant and Class Composition Over Important Overrides](references/style-avoid-important-overrides.md) — HIGH (maintains style specificity and component customization)
   - 3.3 [Define Tailwind v4 Theme Tokens in CSS](references/style-use-tailwind-theme-extend.md) — HIGH (maintains design system consistency)
   - 3.4 [Support Dark Mode with CSS Variables](references/style-dark-mode-support.md) — HIGH (provides user preference compliance and reduces eye strain)
   - 3.5 [Use Consistent Spacing Scale](references/style-consistent-spacing-scale.md) — HIGH (creates visual rhythm and reduces design inconsistency)
   - 3.6 [Use CSS Variables for Theme Colors](references/style-use-css-variables-for-theming.md) — HIGH (enables runtime theme switching and consistency)
4. Form Patterns — **HIGH**
   - 4.1 [Handle Async Validation with Debouncing](references/form-handle-async-validation.md) — HIGH (prevents excessive API calls during validation)
   - 4.2 [Reset Form State Correctly After Submission](references/form-reset-form-state-correctly.md) — HIGH (prevents stale data and submission errors)
   - 4.3 [Show Validation Errors at Appropriate Times](references/form-show-validation-errors-correctly.md) — HIGH (improves user experience and reduces frustration)
   - 4.4 [Use React Hook Form with shadcn/ui Forms](references/form-use-react-hook-form-integration.md) — HIGH (eliminates re-renders and provides validation)
   - 4.5 [Use Zod for Schema Validation](references/form-use-zod-for-schema-validation.md) — HIGH (eliminates runtime type errors with full TS inference)
5. Data Display — **MEDIUM-HIGH**
   - 5.1 [Paginate Large Datasets Server-Side](references/data-paginate-server-side.md) — MEDIUM-HIGH
   - 5.2 [Provide Actionable Empty States](references/data-empty-states-with-guidance.md) — MEDIUM-HIGH
   - 5.3 [Use Skeleton Components for Loading States](references/data-use-skeleton-loading-states.md) — MEDIUM-HIGH
   - 5.4 [Use TanStack Table for Complex Data Tables](references/data-use-tanstack-table-for-complex-tables.md) — MEDIUM-HIGH
   - 5.5 [Virtualize Large Lists and Tables](references/data-virtualize-large-lists.md) — MEDIUM-HIGH
6. Component Composition — **MEDIUM**
   - 6.1 [Combine Command with Popover for Searchable Selects](references/comp-combine-command-with-popover.md) — MEDIUM (reduces selection time for long lists)
   - 6.2 [Compose with Compound Component Patterns](references/comp-compose-with-compound-components.md) — MEDIUM (reduces prop count vs monolithic components)
   - 6.3 [Create Reusable Form Field Components](references/comp-create-reusable-form-fields.md) — MEDIUM (reduces boilerplate and ensures consistency)
   - 6.4 [Nest Dialogs with Proper Focus Management](references/comp-nest-dialogs-correctly.md) — MEDIUM (maintains focus trap hierarchy in nested modals)
   - 6.5 [Use Drawer for Mobile Modal Interactions](references/comp-use-drawer-for-mobile-modals.md) — MEDIUM (reduces touch distance on mobile)
   - 6.6 [Use Slot Pattern for Flexible Content Areas](references/comp-use-slot-pattern-for-flexibility.md) — MEDIUM (enables custom content injection without prop explosion)
7. Performance Optimization — **MEDIUM**
   - 7.1 [Avoid Unnecessary Re-renders in Forms](references/perf-avoid-unnecessary-rerenders-in-forms.md) — MEDIUM (prevents full form re-render on every keystroke)
   - 7.2 [Debounce Search and Filter Inputs](references/perf-debounce-search-inputs.md) — MEDIUM (reduces API calls during typing)
   - 7.3 [Lazy Load Heavy Components](references/perf-lazy-load-heavy-components.md) — MEDIUM (reduces initial bundle)
   - 7.4 [Memoize Expensive Component Renders](references/perf-memoize-expensive-renders.md) — MEDIUM (prevents unnecessary re-renders in lists and data displays)
   - 7.5 [Optimize Icon Imports from Lucide](references/perf-optimize-icon-imports.md) — MEDIUM (reduces bundle size with direct imports)
8. State Management — **LOW-MEDIUM**
   - 8.1 [Colocate State with the Components That Use It](references/state-colocate-state-with-components.md) — LOW-MEDIUM
   - 8.2 [Lift State to the Appropriate Level](references/state-lift-state-to-appropriate-level.md) — LOW-MEDIUM
   - 8.3 [Prefer Uncontrolled Components for Simple Inputs](references/state-prefer-uncontrolled-for-simple-inputs.md) — LOW-MEDIUM
   - 8.4 [Use Controlled State for Dialogs Triggered Externally](references/state-use-controlled-dialog-state.md) — LOW-MEDIUM

---

## References

1. [https://ui.shadcn.com/](https://ui.shadcn.com/)
2. [https://www.radix-ui.com/primitives/docs/overview/accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
3. [https://vercel.com/academy/shadcn-ui](https://vercel.com/academy/shadcn-ui)
4. [https://react-hook-form.com/](https://react-hook-form.com/)
5. [https://tailwindcss.com/](https://tailwindcss.com/)
6. [https://cva.style/docs](https://cva.style/docs)
7. [https://tanstack.com/table/latest](https://tanstack.com/table/latest)
8. [https://tanstack.com/virtual/latest](https://tanstack.com/virtual/latest)

---

## Source Files

This document was compiled from individual reference files. For detailed editing or extension:

| File | Description |
|------|-------------|
| [SKILL.md](SKILL.md) | Quick reference entry point |
