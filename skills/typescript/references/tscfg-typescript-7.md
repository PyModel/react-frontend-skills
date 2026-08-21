---
title: Migrate TypeScript 7 Configuration Deliberately
impact: CRITICAL
impactDescription: accounts for TypeScript 7 defaults, removed options, native compiler, and tooling compatibility
tags: tscfg, typescript-7, migration, tsconfig, compiler
---

## Migrate TypeScript 7 Configuration Deliberately

TypeScript 7 is a native compiler port with TypeScript 6-compatible type-checking behavior, but it adopts TypeScript 6 defaults and turns TypeScript 6 deprecations into hard errors. Upgrade the compiler, editor, and dependent tooling together; do not treat it as a performance-only drop-in.

Important defaults include:

- `strict: true`
- `module: "esnext"`
- `noUncheckedSideEffectImports: true`
- `stableTypeOrdering: true` (cannot be disabled)
- `rootDir: "./"`
- `types: []` (list required global type packages explicitly)

Example application configuration:

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

TypeScript 7 no longer supports `target: "es5"`, `moduleResolution: "node"`/`"node10"`/`"classic"`, `baseUrl`, legacy `module` values such as AMD/UMD/SystemJS, or disabling `esModuleInterop`, `allowSyntheticDefaultImports`, or `alwaysStrict`. Replace those based on the runtime and bundler contract; do not copy `bundler` into Node applications that require `nodenext`.

TypeScript 7.0 does not expose the legacy TypeScript API used by every tool. Where tooling still imports `typescript`, install the TypeScript 6 compatibility package under that name and add TypeScript 7 under a second alias:

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

This provides TypeScript 7's `tsc` and TypeScript 6's `tsc6` plus compiler API. Verify ESLint, framework plugins, build tools, editor support, and declaration output before removing the compatibility bridge. Vue, MDX, Astro, Svelte, Angular template tooling, and other TypeScript-embedding workflows may still require TypeScript 6 until a TypeScript 7 API is available.

### JavaScript and JSDoc differences

TypeScript 7 aligns JavaScript analysis more closely with TypeScript. Audit checked JavaScript separately: values used in type positions now need `typeof`; Closure-style `function(string): void` types should become `(value: string) => void`; standalone `?`, postfix `!`, and special handling for `@enum` or `@class` are no longer supported. Use the upstream `CHANGES.md` linked from the announcement for the complete compatibility list.

### Parallelism controls

TypeScript 7 uses four checker workers by default. The experimental `--checkers` and `--builders` flags trade memory for parallel type checking and project-reference builds; their effects multiply under `--build`. Benchmark them on representative developer and CI machines instead of maximizing both:

```bash
npx tsc --noEmit --checkers 4
npx tsc --build --checkers 2 --builders 2
npx tsc --noEmit --singleThreaded
```

Run version-matched checks after migration:

```bash
npx tsc --version
npx tsc --noEmit
npx tsc6 --noEmit
```

References:
- [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
