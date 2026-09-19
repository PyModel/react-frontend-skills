---
title: Use the Current CLI for Component Lifecycle
impact: MEDIUM-HIGH
impactDescription: dry-run installs, namespaced registries, and agent-friendly inspection
tags: shadcn, cli, registry, mcp, tooling
---

## Use the Current CLI for Component Lifecycle

The shadcn CLI (v3 Aug 2025, v4 Mar 2026) is the supported path for every component lifecycle action. It resolves namespaced registries, previews changes before they land, and exposes an MCP server so agents can search and install from any registry.

**Incorrect (hand-copying component code):**

```bash
# Pasting a Button source from a blog post into components/ui/
# Skips dependency resolution, theme tokens, and registry updates;
# drifts from the checked-in component contract immediately
```

**Correct (CLI with inspection flags):**

```bash
# Search and view before installing
npx shadcn@latest search "data table"
npx shadcn@latest view dialog

# Inspect what will change before it changes
npx shadcn@latest add data-table --dry-run
npx shadcn@latest add data-table --diff

# Install
npx shadcn@latest add data-table
```

**Namespaced registries (`@registry/name`):**

```bash
# Community or private registries, configured in components.json
npx shadcn@latest add @acme/button @internal/auth-system
```

```jsonc
// components.json
{
  "registries": {
    "@acme": "https://registry.acme.dev/{name}.json",
    "@internal": {
      "url": "https://internal.example.com/api/registry/{name}.json",
      "headers": { "Authorization": "Bearer ${REGISTRY_TOKEN}" }
    }
  }
}
```

**Agent workflows:** the built-in MCP server (`npx shadcn@latest mcp`) lets coding agents browse, search, and install components; `shadcn preset`/`apply` applies design-system presets, `shadcn eject` inlines registry components for full ownership, and `npx shadcn@latest create` scaffolds new apps.

**Notes:**

- New projects default to **Base UI** primitives (July 2026); Radix remains fully supported — inspect checked-in components before choosing composition APIs.
- GitHub registries support private repositories; dynamic search lets large registries handle search server-side.
- Run installs on a clean branch and review the diff — installed files and dependency changes are ordinary project code.
