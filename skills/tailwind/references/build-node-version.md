---
title: Use Node.js 20+ for the Upgrade Tool
impact: CRITICAL
impactDescription: satisfies the official @tailwindcss/upgrade requirement
tags: build, node, runtime, compatibility, tooling
---

## Use Node.js 20+ for the Upgrade Tool

The official `@tailwindcss/upgrade` tool requires Node.js 20 or newer. Do not generalize that migration-tool requirement into an unsupported runtime claim for every Tailwind integration; check the installed package, framework, and deployment runtime constraints together.

**Incorrect (run the upgrade tool on an unsupported Node release):**

```bash
node --version # v18.x
npx @tailwindcss/upgrade
```

**Correct (run the one-time migration under Node 20+):**

```bash
nvm exec 20 npx @tailwindcss/upgrade
```

Check the migration environment before running the tool:

```bash
node --version
npx @tailwindcss/upgrade
```

If the project must run on an older Node release, running the migration under Node 20 does not by itself change the application's declared runtime support. Set `package.json#engines` from the application and dependency runtime contract, not merely from the one-time upgrade command.

```json
{
  "engines": {
    "node": ">=20"
  }
}
```

Add an application engine constraint like this only when the application and its runtime dependencies require it, not solely because the migration command did.

Reference: [Tailwind CSS Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
