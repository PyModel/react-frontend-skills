---
title: Customize Container with @utility
impact: MEDIUM
impactDescription: full CSS control over container centering and padding
tags: comp, container, utility, customization, layout
---

## Customize Container with @utility

The `container` utility has no `center` or `padding` options. Override it with `@utility` to center it and add padding.

**Incorrect (JavaScript config options that Tailwind ignores):**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
  },
};
```

**Correct (@utility customization):**

```css
@import "tailwindcss";

@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
}
```

**With responsive padding:**

```css
@utility container {
  margin-inline: auto;
  padding-inline: 1rem;

  @media (width >= 640px) {
    padding-inline: 2rem;
  }

  @media (width >= 1024px) {
    padding-inline: 4rem;
  }
}
```

**Benefits:**
- Full CSS control over container behavior
- Responsive customization without config
- Consistent with the CSS-first approach

Reference: [Tailwind CSS Container](https://tailwindcss.com/docs/max-width#container)
