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

TypeScript 7 does not yet expose the legacy TypeScript API used by every tool. Where tooling still imports `typescript`, the official transition guidance supports installing the TypeScript 6 compatibility package and the TypeScript 7 compiler side by side through npm aliases. Verify ESLint, framework plugins, build tools, editor support, and declaration output before removing that bridge.

Run version-matched checks after migration:

```bash
npx tsc --version
npx tsc --noEmit
```

References:
- [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
