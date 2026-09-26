---
title: Override Environment Per File When Needed
impact: MEDIUM
impactDescription: Allows mixing node and browser tests without separate config files
tags: env, environment, docblock, jsdom, happy-dom
---

## Override Environment Per File When Needed

Not all tests need a DOM environment. Running DOM tests in node mode fails, while running pure logic tests in jsdom wastes resources. Use per-file environment overrides to match test needs.

**Incorrect (same environment for all):**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // All tests run in jsdom, even pure logic tests
    environment: 'jsdom',
  },
})
```

**Correct (per-file environment):**

```typescript
// src/utils/math.test.ts
// Pure logic - no DOM needed, runs faster in node
import { describe, it, expect } from 'vitest'

describe('math utils', () => {
  it('should add numbers', () => {
    expect(add(1, 2)).toBe(3)
  })
})
```

```typescript
// src/components/Button.test.tsx
/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Button', () => {
  it('should render', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

**Environment options:**

| Environment | Use For |
|-------------|---------|
| `node` (default) | Pure logic, Node.js APIs, utilities |
| `jsdom` | Full DOM compatibility, complex browser APIs |
| `happy-dom` | Fast DOM testing, most component tests |
| `edge-runtime` | Edge function testing |

**Configuration-based overrides:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // environmentMatchGlobs was removed in Vitest 4.0. Use projects instead.
    projects: [
      {
        test: {
          name: 'node',
          include: ['src/**/*.test.ts'],
          // Without this, component and hook tests also run in the node project
          exclude: ['src/components/**', 'src/hooks/**'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'dom',
          include: [
            'src/components/**/*.test.{ts,tsx}',
            'src/hooks/**/*.test.{ts,tsx}',
          ],
          environment: 'happy-dom',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['tests/e2e/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
        },
      },
    ],
  },
})
```

Since Vitest 5, inline projects inherit the root `test` config. Arrays are concatenated: a root `include: ['**/*.a.test.ts']` is added to every project's own `include`, and root `setupFiles` run in every project. `name` and `globalSetup` are not inherited. Keep shared arrays out of the root config, or set `extends: false` on a project that must start clean:

```typescript
projects: [
  { extends: false, test: { name: 'e2e', include: ['tests/e2e/**/*.test.ts'], environment: 'node' } },
]
```

**Benefits:**
- Faster tests for pure logic
- Correct environment for DOM tests
- Flexible per-test-file control

Reference: [Vitest Test Environment](https://vitest.dev/guide/environment) · [Vitest Projects configuration](https://vitest.dev/guide/projects#configuration)
