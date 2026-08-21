---
title: Enable isolatedModules for Single-File Transpilers
impact: CRITICAL
impactDescription: reports constructs that Babel, SWC, esbuild, and similar transpilers cannot safely emit per file
tags: tscfg, isolatedModules, transpilation, bundlers, correctness
---

## Enable isolatedModules for Single-File Transpilers

Enable `isolatedModules` when JavaScript is emitted one file at a time by Babel, SWC, esbuild, or another non-TypeScript transpiler. The flag does not parallelize or speed up `tsc`; it asks TypeScript to report source constructs that a single-file transpiler cannot interpret safely.

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noEmit": true
  }
}
```

Keep a separate `tsc --noEmit` or build-mode check for whole-program type checking.

Common diagnostics include exporting a name that is only a type, namespaces in scripts, and references to ambient `const enum` members. Use type-only exports/imports and prefer modern module-safe patterns:

```typescript
// types.ts
export interface User {
  id: string
}

// index.ts
export type { User } from './types'
```

`verbatimModuleSyntax` makes type/value intent explicit but is a separate option. Do not claim that `isolatedModules` itself changes runtime output performance.

References:
- [TypeScript isolatedModules](https://www.typescriptlang.org/tsconfig/isolatedModules.html)
- [TypeScript performance wiki: isolated file emit](https://github.com/microsoft/TypeScript/wiki/Performance#isolated-file-emit)
