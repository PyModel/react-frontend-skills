---
title: Require Node.js 22+ for MSW
impact: CRITICAL
impactDescription: Node 18 and 20 are unsupported; installs warn or fail
tags: setup, node, version, requirements, compatibility
---

## Require Node.js 22+ for MSW

MSW sets Node.js 22 as the minimum supported version (the package's `engines` field is `>=22.12.0`) and tests against Node 22, 24 and 26. Node 18 and 20 are not supported.

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
# Node 20 - below MSW's supported range
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
npm ls msw  # Should be 3.x
```

Reference: [MSW Getting started](https://mswjs.io/docs/quick-start)
