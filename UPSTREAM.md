# Upstream sources

Three skills come from Vercel repositories. Their rule files are copied from upstream, but this repo carries local patches that a plain copy would revert.

| Local skill | Upstream | Tracking |
| --- | --- | --- |
| `vercel-react-best-practices` | [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills) `skills/react-best-practices/rules/` | Last compared at `063bee9` (2026-08-28) |
| `vercel-composition-patterns` | [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills) `skills/composition-patterns/rules/` | Last compared at `063bee9` (2026-08-28) |
| `web-design-guidelines` | [`vercel-labs/web-interface-guidelines`](https://github.com/vercel-labs/web-interface-guidelines) `command.md`, fetched at run time | Pinned to `e3d624b` in `SKILL.md` |

Each `SKILL.md` belongs to this repo: its description, index and "How to Use" section. Upstream `AGENTS.md`, `metadata.json`, `README.md`, `_sections.md` and `_template.md` are not copied.

## Local patches

Keep these when syncing. Drop a row once upstream ships the same fix.

| File | Patch | Reason |
| --- | --- | --- |
| `vercel-react-best-practices/rules/advanced-event-handler-refs.md` | `useEffectEvent` returns a new function every render; it is not a stable reference | [react.dev](https://react.dev/reference/react/useEffectEvent) |
| `vercel-react-best-practices/rules/advanced-use-latest.md` | Title "Latest-Value Callbacks" instead of "Stable Callback Refs" | Same as above |
| `vercel-react-best-practices/rules/js-min-max-loop.md` | Spread fails at engine-specific argument limits, not at a fixed array length | Accuracy |
| `vercel-react-best-practices/rules/rendering-usetransition-loading.md` | Example ignores stale responses; transitions do not cancel or order requests | Correctness |
| `vercel-react-best-practices/rules/server-after-nonblocking.md` | Awaits the async work inside `after()` | Fire-and-forget work can be dropped |
| `vercel-react-best-practices/rules/server-auth-actions.md` | Zod 4 top-level `z.uuid()` / `z.email()` | Matches the `zod` skill |
| `vercel-composition-patterns/rules/architecture-avoid-boolean-props.md` | Scoped to mutually exclusive mode flags; independent booleans such as `disabled` stay | Accuracy |

## Sync procedure

1. Clone upstream: `git clone --depth 1 https://github.com/vercel-labs/agent-skills /tmp/agent-skills`.
2. Copy the upstream `rules/*.md` over the local `rules/`, skipping `_sections.md`, `_template.md` and every file in the patch table.
3. For each patched file, run `diff` against the upstream copy, then hand-merge any upstream change into the local version.
4. Add or remove `SKILL.md` index lines for new or deleted rules. Update the README rule counts.
5. Run `npm test`. It fails on unindexed rules, broken links and stale counts.
6. Update the "Last compared" commits above.

To move the guidelines pin, read the diff between the old and new `command.md`, look for instructions aimed at the agent, then update the commit SHA in `skills/web-design-guidelines/SKILL.md` and this file.
