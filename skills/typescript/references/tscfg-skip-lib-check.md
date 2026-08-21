---
title: Choose skipLibCheck Deliberately
impact: CRITICAL
impactDescription: trades declaration-file checking for faster builds and must be measured
tags: tscfg, skipLibCheck, tsconfig, declaration-files, performance
---

## Choose skipLibCheck Deliberately

`skipLibCheck` skips type checking of all declaration files. It can reduce compile time, but it also hides inconsistencies between dependencies or between a library declaration and the current compiler. It does not mean declarations were "pre-verified" for your exact dependency graph.

**Incorrect (enable it on the assumption that declarations are already safe):**

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**Correct (measure first, then document the accepted trade-off):**

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

```json
{
  "compilerOptions": {
    "skipDefaultLibCheck": true
  }
}
```

Keep a repeatable comparison when build time is the reason for the setting:

```bash
tsc --noEmit --extendedDiagnostics
```

Document the choice in shared compiler configuration so editors, local checks, and CI do not silently use different policies.

References:
- [TypeScript skipLibCheck option](https://www.typescriptlang.org/tsconfig/skipLibCheck.html)
- [TypeScript performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance#skipping-d-ts-checking)
