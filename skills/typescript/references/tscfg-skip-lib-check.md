---
title: Choose skipLibCheck Deliberately
impact: CRITICAL
impactDescription: trades declaration-file checking for faster builds and must be measured
tags: tscfg, skipLibCheck, tsconfig, declaration-files, performance
---

## Choose skipLibCheck Deliberately

`skipLibCheck` skips type checking of all declaration files. It can reduce compile time, but it also hides inconsistencies between dependencies or between a library declaration and the current compiler. It does not mean declarations were "pre-verified" for your exact dependency graph.

Measure before enabling it:

```bash
tsc --noEmit --extendedDiagnostics
```

If declaration checking is a demonstrated bottleneck and the project accepts the reduced coverage:

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}
```

Prefer fixing duplicate or conflicting dependency versions when possible. Keep full declaration checking when publishing a library, validating generated declarations, investigating dependency type conflicts, or when the time saving is negligible.

`skipDefaultLibCheck` is narrower: it skips TypeScript's default library declaration files but still checks third-party declarations.

Document the choice in shared compiler configuration so editors, local checks, and CI do not silently use different policies.

References:
- [TypeScript skipLibCheck option](https://www.typescriptlang.org/tsconfig/skipLibCheck.html)
- [TypeScript performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance#skipping-d-ts-checking)
