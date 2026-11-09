---
title: Use Correct JSDOM Environment for Jest
impact: HIGH
impactDescription: Prevents Node.js global conflicts; ensures proper fetch availability
tags: test, jest, jsdom, environment, configuration
---

## Use Correct JSDOM Environment for Jest

Use `jest-fixed-jsdom` instead of `jest-environment-jsdom` when testing with MSW in Jest. Standard JSDOM uses browser export conditions but runs in Node.js, causing conflicts with MSW's entrypoints.

**Incorrect (standard jsdom environment):**

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',  // Uses browser exports incorrectly
}
```

```typescript
// Tests fail with cryptic errors
// TypeError: Cannot read properties of undefined
// or: fetch is not defined
```

**Correct (use jest-fixed-jsdom):**

```bash
npm install -D jest-fixed-jsdom
```

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-fixed-jsdom',
}
```

**Why this matters:**

JSDOM uses browser export conditions by default, causing packages like MSW to use browser-specific code in a Node.js context. This leads to:
- Missing Node.js globals
- Incorrect module resolution
- Silent failures or cryptic errors

`jest-fixed-jsdom` handles the Node.js/browser boundary correctly. MSW is ESM-only, so the Jest setup must also be able to load ESM packages.

**When NOT to use this pattern:**
- Vitest users don't need this; Vitest handles environments correctly
- Node-only tests (no DOM) should use `testEnvironment: 'node'`

Reference: [MSW Node.js integration](https://mswjs.io/docs/integrations/node)
