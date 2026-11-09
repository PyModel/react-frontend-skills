---
title: Understand Hover Behavior on Touch Devices
impact: MEDIUM
impactDescription: prevents sticky hover states on mobile
tags: resp, hover, touch, mobile, interaction
---

## Understand Hover Behavior on Touch Devices

Tailwind only applies hover styles on devices that support hover, preventing "sticky" hover states on touch devices.

**Incorrect (relying on hover as the only feedback):**

```html
<button class="bg-blue-500 hover:bg-blue-600">
  <!-- Hover only applies on hover-capable devices; touch gets no feedback -->
</button>
```

**Correct (understanding the behavior):**

```html
<!-- The default hover behavior is correct for most cases -->
<button class="bg-blue-500 hover:bg-blue-600">
  <!-- Desktop: hover works as expected -->
  <!-- Touch: no sticky hover state -->
</button>

<!-- For touch-specific feedback, use active: -->
<button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700">
  <!-- Desktop: hover + active -->
  <!-- Touch: active provides feedback -->
</button>
```

**Generated CSS:**

```css
@media (hover: hover) {
  .hover\:bg-blue-600:hover {
    background-color: var(--color-blue-600);
  }
}
```

**Touch interaction patterns:**

```html
<button class="
  bg-blue-500
  hover:bg-blue-600
  active:bg-blue-700
  focus-visible:ring-2
">
  Touch-friendly button
</button>
```

Reference: [Tailwind CSS Hover, Focus and Other States](https://tailwindcss.com/docs/hover-focus-and-other-states#hover)
