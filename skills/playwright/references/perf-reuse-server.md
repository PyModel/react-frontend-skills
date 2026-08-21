---
title: Reuse a Matching Local Server When Safe
impact: MEDIUM
impactDescription: shortens local iteration without changing the tested server mode
tags: perf, webserver, configuration, development, startup
---

## Reuse a Matching Local Server When Safe

`reuseExistingServer` can shorten local iteration, but Playwright only checks whether the URL responds; it cannot prove the existing process uses the expected build, environment, or revision. Reuse locally only when the developer controls that process. Keep CI isolated.

**Incorrect (always starts new server):**

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    // Always starts new server, even if one is running
    reuseExistingServer: false,
  },
});
```

**Correct (reuse locally, fresh in CI):**

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    // Reuse existing server locally, start fresh in CI
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Build can take time
  },
});
```

**Local development workflow:**

```bash
# Terminal 1: Start the same server mode configured for the suite.
npm run start

# Terminal 2: Run tests repeatedly (reuses that matching server)
npx playwright test
npx playwright test --ui   # interactive watch and re-run
```

**Multiple servers for different apps:**

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: [
    {
      command: 'npm run start:frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start:api',
      url: 'http://localhost:4000',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

**Environment-specific server commands:**

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

Do not reuse a development server for a suite whose contract is a production build. If fast dev-server smoke tests are useful, define them as a separate project with an explicit, narrower purpose.

Reference: [Playwright Web Server](https://playwright.dev/docs/test-webserver)
