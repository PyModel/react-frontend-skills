---
title: Require Node.js 22+ for MSW v3
impact: CRITICAL
impactDescription: MSW v3 drops Node 18 and 20; older versions are unsupported
tags: setup, node, version, requirements, compatibility
---

## Require Node.js 22+ for MSW v3

MSW 3 sets Node.js 22 as the minimum supported version (the package's `engines` field is `>=22.12.0`) and tests against Node 22, 24 and 26. Node 18 and 20 are no longer supported.

On MSW 2.x: the minimum is Node.js 18 (`"engines": { "node": ">=18.0.0" }`).

**Incorrect (using unsupported Node version):**

```json
// package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

```bash
# Node 20 - below MSW 3's supported range
$ node -v
v20.18.0

$ npm install msw@3
# npm warn EBADENGINE Unsupported engine { required: { node: '>=22.12.0' } }
```

**Correct (enforce Node 22+ requirement):**

```json
// package.json
{
  "engines": {
    "node": ">=22.12.0"
  }
}
```

```yaml
# .nvmrc (Node 22 LTS, latest release)
lts/jod
```

```yaml
# CI configuration (GitHub Actions)
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22, 24]
```

**Verify installation:**

```bash
# Check Node version
node -v  # Should be v22.12.0 or higher

# Check MSW version
npm ls msw  # Should be v3.x.x
```

**When NOT to use this pattern:**
- If stuck on Node 18 or 20, stay on MSW 2.x (see the version table in SKILL.md)

Reference: [MSW 2.x → 3.x Migration - Node.js version](https://mswjs.io/docs/migrations/2.x-to-3.x#node-js-version)
