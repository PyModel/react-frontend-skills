---
title: Configure tsconfig for TypeScript 7
impact: CRITICAL
impactDescription: sets explicit module, resolution, rootDir, and types for the native compiler
tags: tscfg, typescript-7, tsconfig, compiler
---

## Configure tsconfig for TypeScript 7

TypeScript 7 is the native compiler. Its defaults are strict and explicit, so declare module resolution, `rootDir`, and global types yourself.

Defaults to know:

- `strict: true`
- `module: "esnext"`
- `noUncheckedSideEffectImports: true`
- `stableTypeOrdering: true` (cannot be disabled)
- `rootDir: "./"`
- `types: []` (list required global type packages explicitly)

**Correct (bundler application):**

```json
{
  "compilerOptions": {
    "module": "preserve",
    "moduleResolution": "bundler",
    "rootDir": "./src",
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src"]
}
```

**Correct (Node application):**

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "rootDir": "./src",
    "outDir": "./dist",
    "types": ["node"]
  },
  "include": ["src"]
}
```

Use `bundler` only when a bundler resolves imports; Node applications use `nodenext`.

Options TypeScript 7 does not support, so never set them: `target: "es5"`, `moduleResolution: "node"`/`"node10"`/`"classic"`, `baseUrl`, `module` values AMD/UMD/SystemJS/`none`, `downlevelIteration`, and `esModuleInterop`, `allowSyntheticDefaultImports`, or `alwaysStrict` set to `false`. Map aliases with `paths` relative to the tsconfig.

### JavaScript and JSDoc

Checked JavaScript follows TypeScript rules: values in type positions need `typeof`, function types use `(value: string) => void`, and standalone `?`, postfix `!`, and special `@enum` or `@class` handling are not supported.

### Tooling that needs the compiler API

TypeScript 7 (native, `tsgo`) does not expose the JavaScript compiler API that ESLint/typescript-eslint and some framework plugins load by importing `typescript`. For those tools, install the TypeScript 6 compatibility package under the `typescript` name and TypeScript 7 under a second alias:

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

This provides TypeScript 7's `tsc` and TypeScript 6's `tsc6` plus the compiler API. Verify ESLint, framework plugins, build tools, editor support, and declaration output. Vue, MDX, Astro, Svelte, Angular template tooling, and other TypeScript-embedding workflows load the `typescript` alias.

### Parallelism controls

TypeScript 7 uses four checker workers by default. The experimental `--checkers` and `--builders` flags trade memory for parallel type checking and project-reference builds; their effects multiply under `--build`. Benchmark on representative developer and CI machines instead of maximizing both:

```bash
npx tsc --noEmit --checkers 4
npx tsc --build --checkers 2 --builders 2
npx tsc --noEmit --singleThreaded
```

Verify with:

```bash
npx tsc --version
npx tsc --noEmit
npx tsc6 --noEmit
```

References:
- [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
