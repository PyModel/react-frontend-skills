---
title: Use Run Mode in CI Environments
impact: MEDIUM
impactDescription: Avoids watch mode overhead and file system polling in CI
tags: perf, ci, run-mode, watch, configuration
---

## Use Run Mode in CI Environments

Vitest's default watch mode is designed for development, continuously watching files and providing an interactive UI. In CI, this overhead is wasted. Use `--run` to execute tests once and exit.

**Incorrect (watch mode in CI):**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      # Watch mode starts, hangs waiting for file changes
      - run: npx vitest
```

**Correct (run mode in CI):**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      # Runs tests once and exits
      - run: npx vitest run
```

**Automatic detection:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Vitest automatically uses run mode when CI=true
    // But explicit configuration is clearer
    watch: !process.env.CI,
  },
})
```

**Additional CI optimizations:**

```yaml
jobs:
  test:
    env:
      CI: true
    steps:
      - run: npx vitest run --reporter=github-actions
```

**CI-specific reporters:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    reporters: process.env.CI
      ? ['default', 'github-actions']
      : ['default'],
  },
})
```

Vitest 5 writes reports to `.vitest/`: `json` to `.vitest/json/output.json`, `junit` to `.vitest/junit/output.xml`, blobs to `.vitest/blob/` and HTML to `.vitest/index.html`. `vitest run --reporter=json | jq` no longer works. Read the file, or pass `{ stdout: true }` to that reporter. An explicit `outputFile` still wins. Add `.vitest` to `.gitignore`, and upload it as a CI artifact when you need the reports.

```typescript
reporters: ['default', ['junit', { stdout: true }]],
```

**Package.json scripts:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run --coverage"
  }
}
```

**Benefits:**
- No hanging processes in CI
- Faster startup without watch setup
- Clear exit codes for CI systems

Reference: [Vitest CLI](https://vitest.dev/guide/cli) · [Vitest 5 migration: reports use .vitest](https://vitest.dev/guide/migration#generated-reports-and-artifacts-use-the-vitest-directory)
