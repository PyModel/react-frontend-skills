---
title: Test Against Production Builds
impact: CRITICAL
impactDescription: catches build-only bugs, matches real behavior
tags: arch, production, build, next-start, configuration
---

## Test Against Production Builds

A development server cannot validate production-only bundling, environment, and runtime behavior. Run CI/release E2E suites against a production build. A separate development-server smoke project may be useful for fast local feedback, but it does not replace the production-mode gate.

**Incorrect (testing dev server):**

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev', // Dev server has different behavior
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});

// Tests pass in dev but fail in production due to:
// - Hot reload interference
// - Unminified code paths
// - Development-only error boundaries
```

**Correct (testing production build):**

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Build can take time
  },
});

// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "test:e2e": "playwright test",
    "test:e2e:ci": "npm run build && playwright test"
  }
}
```

**Alternative (pre-built for faster local iteration):**

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: process.env.CI
      ? 'npm run build && npm run start'
      : 'npm run start', // Assumes build exists locally
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Benefits:**
- Tests match production behavior exactly
- Catches minification and tree-shaking bugs
- Validates environment variable handling

Reference: [Next.js Testing with Playwright](https://nextjs.org/docs/pages/guides/testing/playwright)
