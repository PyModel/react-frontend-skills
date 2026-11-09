---
title: Use the @tailwindcss/cli Package
impact: HIGH
impactDescription: prevents build failures from running the wrong package
tags: build, cli, package, tooling
---

## Use the @tailwindcss/cli Package

The Tailwind CLI ships as `@tailwindcss/cli`. The `tailwindcss` package is the core library and has no CLI entry for `npx`.

**Incorrect (npx resolves the core package):**

```bash
npx tailwindcss -i input.css -o output.css
```

**Correct (CLI package):**

```bash
npx @tailwindcss/cli -i input.css -o output.css
```

```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./src/input.css -o ./dist/output.css --minify"
  },
  "devDependencies": {
    "@tailwindcss/cli": "^4.3.0"
  }
}
```

`@tailwindcss/cli` installs a binary named `tailwindcss`, so npm scripts can call `tailwindcss` directly; only `npx tailwindcss` (which resolves the core package) fails.

**Note:** With the Vite or PostCSS integration you don't need the CLI at all.

Reference: [Tailwind CSS Installation](https://tailwindcss.com/docs/installation/tailwind-cli)
