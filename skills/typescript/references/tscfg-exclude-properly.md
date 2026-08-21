---
title: Configure Include and Exclude Properly
impact: CRITICAL
impactDescription: prevents scanning thousands of unnecessary files
tags: tscfg, include, exclude, tsconfig, file-discovery
---

## Configure Include and Exclude Properly

TypeScript walks included directories to discover root files. Prefer a narrow `include` over a broad glob plus a long `exclude` list. `exclude` only affects files discovered through `include`; an excluded file is still part of the program when imported, referenced by `types`, or otherwise reached as a dependency.

**Incorrect (scans entire project tree):**

```json
{
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["**/*"]
}
```

```bash
# Scans node_modules, dist, coverage, .git...
# Discovery time: 5+ seconds on large projects
```

**Correct (targeted include with explicit exclude):**

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "coverage",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/__tests__/**"
  ]
}
```

```bash
# Only scans src/ directory
# Discovery time: <1 second
```

**For separate test configuration:**

```json
// tsconfig.json (production)
{
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts"]
}

// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*", "tests/**/*"]
}
```

**Diagnostic commands:**

```bash
# List all files TypeScript will compile
tsc --listFiles

# Explain why each file was included
tsc --explainFiles
```

**Common root files to exclude when a broad include is unavoidable:**
- Build output directories (`dist`, `build`, `out`)
- Test files for production builds
- Generated files (`.generated.ts`)
- Coverage reports (`coverage`)

Reference: [TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance#configuring-tsconfigjson-or-jsconfigjson)
