<h1 align="center">React Frontend Skills</h1>

<p align="center">
  <strong>Production-grade AI agent skills for the modern React ecosystem, by PyModel</strong>
</p>

<p align="center">
  <a href="https://github.com/PyModel/react-frontend-skills/stargazers"><img src="https://img.shields.io/github/stars/PyModel/react-frontend-skills?style=flat&logo=github&logoColor=white&color=f5c518&labelColor=1c1c1c" alt="Stars" /></a>
  <a href="https://github.com/PyModel/react-frontend-skills/network/members"><img src="https://img.shields.io/github/forks/PyModel/react-frontend-skills?style=flat&logo=github&logoColor=white&color=4f8cc9&labelColor=1c1c1c" alt="Forks" /></a>
  <a href="https://github.com/PyModel/react-frontend-skills/issues"><img src="https://img.shields.io/github/issues/PyModel/react-frontend-skills?style=flat&logo=github&logoColor=white&color=e07b39&labelColor=1c1c1c" alt="Issues" /></a>
  <a href="https://www.npmjs.com/package/@pymodel/react-frontend-skills"><img src="https://img.shields.io/npm/v/@pymodel/react-frontend-skills?style=flat&logo=npm&logoColor=white&color=cb3837&labelColor=1c1c1c" alt="npm" /></a>
  <a href="https://skills.sh/PyModel/react-frontend-skills"><img src="https://skills.sh/b/PyModel/react-frontend-skills" alt="skills.sh installs" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/PyModel/react-frontend-skills?style=flat&color=3fb950&labelColor=1c1c1c" alt="License" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#install-per-agent">Per-agent install</a> ·
  <a href="#skills-included">Skills</a> ·
  <a href="#why">Why</a> ·
  <a href="#contributing">Contributing</a>
</p>

---

## What is this?

React Frontend Skills is a collection of 18 AI agent skills for the React ecosystem. Drop them into your coding assistant and it starts applying real patterns for performance, UI, testing, data, and architecture instead of whatever it remembered from 2023.

Each skill is a portable `SKILL.md` folder that indexes detailed `references/` or `rules/` files, loaded only when a task needs them. The layout follows the open agent-skills convention, so it works across major AI coding agents. A zero-dependency [companion CLI](#companion-cli) handles the deterministic steps: version detection and deprecated-API scans.

Coverage: React 19 and Next.js 16 performance, Tailwind CSS v4 and shadcn/ui, testing with Vitest, Playwright and MSW, data handling with TanStack Query, Zod, React Hook Form and nuqs, plus feature-based architecture.

## Quick start

One command installs everything and auto-detects the AI agents on your machine:

```bash
npx skills add PyModel/react-frontend-skills --all
```

Pick specific skills instead:

```bash
npx skills add PyModel/react-frontend-skills -s react,nextjs,tailwind
```

Install at the user level so every project sees them:

```bash
npx skills add PyModel/react-frontend-skills --all -g
```

This uses the open-source `skills` CLI. No account, no config. Skills get symlinked into your agent's directory and activate when relevant.

### Or install from npm

Published as [`@pymodel/react-frontend-skills`](https://www.npmjs.com/package/@pymodel/react-frontend-skills). Add it as a project dependency, then sync into your agent:

```bash
npm install @pymodel/react-frontend-skills
npx skills experimental_sync
```

`experimental_sync` reads the package from `node_modules` and installs all 18 skills into your detected agent.

### Or connect through MCP

The separate [`@pymodel/react-frontend-skills-mcp`](https://www.npmjs.com/package/@pymodel/react-frontend-skills-mcp) package exposes every skill and reference file through read-only MCP tools and resources:

```json
{
  "mcpServers": {
    "react-frontend-skills": {
      "command": "npx",
      "args": ["-y", "@pymodel/react-frontend-skills-mcp"]
    }
  }
}
```

See [`mcp/README.md`](mcp/README.md) for the tool catalog and development details.

## Companion CLI

Rules that a machine can check live in code, not prose. Agents run these in the project they are editing:

```bash
npx -y @pymodel/react-frontend-skills detect   # installed versions vs. each skill's target major
npx -y @pymodel/react-frontend-skills scan     # deprecated/removed API usage → skill/rule to read
npx -y @pymodel/react-frontend-skills scan --skill zod --json
```

`scan` runs its 28 checks only for packages declared in `package.json`, and only when both the declared range and the installed version are at or above the major where the old API went away (`--all` overrides every gate). Inside a git work tree it scans what git tracks, so `.gitignore`d copies and builds are skipped; comment lines never count. It exits `1` when it finds hits. Each hit names a rule ID, and the fix is in that skill's `references/<rule>.md` (or `rules/<rule>.md`).

`detect` reports `range-mismatch` when the resolved install is a different major than `package.json` declares (for example, a hoisted copy from a parent directory).

## Install per agent

Target a single agent with `-a <agent>`. Use `-s '*'` for all skills and `-g` for a global install.

| Agent | Command |
| ----- | ------- |
| Claude Code | `npx skills add PyModel/react-frontend-skills -a claude-code -s '*' -y` |
| Codex | `npx skills add PyModel/react-frontend-skills -a codex -s '*' -y` |
| Cursor | `npx skills add PyModel/react-frontend-skills -a cursor -s '*' -y` |
| OpenCode | `npx skills add PyModel/react-frontend-skills -a opencode -s '*' -y` |
| Pi | `npx skills add PyModel/react-frontend-skills -a pi -s '*' -y` |
| Kiro CLI | `npx skills add PyModel/react-frontend-skills -a kiro-cli -s '*' -y` |

<details>
<summary><strong>Pythinker and other agents (manual install)</strong></summary>

Every skill ships a standard `SKILL.md` that indexes its rule files. Agents that read local instruction files can consume those directly, no CLI required:

```bash
# Clone once
git clone https://github.com/PyModel/react-frontend-skills.git

# Point your agent at the skills directory, or copy what you need
cp -r react-frontend-skills/skills/react   ./.agent/skills/
cp -r react-frontend-skills/skills/nextjs  ./.agent/skills/
```

Then reference `skills/<name>/SKILL.md` from your agent context. This is the path for Pythinker and custom in-house agents.

</details>

<details>
<summary><strong>Other supported agents</strong></summary>

The `skills` CLI supports dozens of agents beyond the table above, among them GitHub Copilot, Gemini CLI, Windsurf, Cline, Roo, Goose, Kilo, Droid, Antigravity, Trae, Warp, Zed, Continue, and Qwen Code. Run `npx skills add PyModel/react-frontend-skills` with no agent flag and it detects yours.

</details>

## Skills included

### Audited version baseline

This repository contains guidance, not runtime dependencies. Last re-audited on 2026-09-26 against these releases:

| Area | Audited line |
| --- | --- |
| React | 19.3 (`react` 19.3.0) |
| Next.js | 16.3 (`next` 16.3.6) |
| TypeScript | 7.0 (`typescript` 7.0.2) |
| Tailwind CSS | 4.3 (`tailwindcss` 4.3.3) |
| Vitest | 5.0 (`vitest` 5.0.2) |
| Playwright | 1.63 (`@playwright/test` 1.63.0) |
| MSW | 2.15 (`msw` 2.15.0) |
| TanStack Query | 5.x (`@tanstack/react-query` 5.104.0) |
| React Hook Form | 7.x (`react-hook-form` 7.89.0) |
| Zod | 4.6 (`zod` 4.6.5) |
| nuqs | 2.10 (`nuqs` 2.10.1) |

For each package that changed since the 2026-08-20 baseline, every API that its release notes and migration guides list as deprecated, removed, renamed or given a new default was searched for across the rule files, and each matching section was read. Rules were not re-read line by line. New features the rules don't cover yet are not part of the audit. If your project pins a different version, trust that version's official docs over this baseline.

### Core framework

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [react](skills/react) | 44 | React 19 concurrent rendering, Server Components, hook optimization |
| [nextjs](skills/nextjs) | 42 | Next.js 16 App Router, caching, server components, routing |
| [typescript](skills/typescript) | 44 | TypeScript 7 migration, compiler config, type safety, async patterns |

### UI and styling

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [tailwind](skills/tailwind) | 42 | Tailwind CSS v4 optimization, utility patterns, theming |
| [shadcn](skills/shadcn) | 44 | shadcn/ui with Radix or Base UI primitives, accessibility |
| [ui-design](skills/ui-design) | 42 | UI and UX practices, accessibility, responsive design |
| [web-design-guidelines](skills/web-design-guidelines) | pinned | Reviews UI code against Vercel's Web Interface Guidelines, fetched from a pinned upstream commit |

### Data and state

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [tanstack-query](skills/tanstack-query) | 41 | Data fetching, caching, mutations, optimistic updates |
| [react-hook-form](skills/react-hook-form) | 45 | Form validation, performance, field arrays |
| [zod](skills/zod) | 46 | Schema validation, type inference, error handling |
| [nuqs](skills/nuqs) | 42 | Type-safe URL query state for Next.js |

### Testing

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [vitest](skills/vitest) | 46 | Vitest 5 setup, mocking, async testing, worker pools |
| [playwright](skills/playwright) | 45 | End-to-end testing, selectors, authentication, CI |
| [msw](skills/msw) | 48 | API mocking with Mock Service Worker |
| [tdd](skills/tdd) | 42 | Test-driven development methodology |

### Architecture and practices

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [feature-arch](skills/feature-arch) | 42 | Feature-based architecture, module organization |
| [vercel-composition-patterns](skills/vercel-composition-patterns) | 8 | React composition patterns |
| [vercel-react-best-practices](skills/vercel-react-best-practices) | 70 | React performance optimization |

## Why

### Source-grounded

Every skill is built from official documentation and patterns that held up in production work, not recycled generic advice.

### Prioritized by impact

| Priority | Impact | What lands here |
| -------- | ------ | --------------- |
| CRITICAL | Major | Performance problems, build failures |
| HIGH | Significant | Noticeable improvements |
| MEDIUM | Important | Standard practices |
| LOW | Minor | Edge cases and small optimizations |

### Actionable rules

Each rule spells out the correct pattern with code, the anti-pattern to avoid, the reason behind it, and how to apply it.

## Project structure

```text
react-frontend-skills/
├── .github/workflows/         # CI: npm test + MCP check on Node 20 and 24
├── bin/                       # Companion CLI (detect, scan, lint)
├── mcp/                       # Publishable read-only MCP server
├── skills/
│   ├── react/                # React 19 patterns
│   ├── nextjs/               # Next.js 16 App Router
│   ├── typescript/           # TypeScript optimization
│   ├── tailwind/             # Tailwind CSS v4
│   ├── shadcn/               # shadcn/ui components
│   ├── tanstack-query/       # Data fetching and caching
│   ├── react-hook-form/      # Form handling
│   ├── zod/                  # Schema validation
│   ├── nuqs/                 # URL state management
│   ├── vitest/               # Unit testing
│   ├── playwright/           # E2E testing
│   ├── msw/                  # API mocking
│   ├── tdd/                  # TDD methodology
│   ├── feature-arch/         # Feature architecture
│   ├── ui-design/            # UI and UX practices
│   ├── vercel-composition-patterns/
│   ├── vercel-react-best-practices/
│   └── web-design-guidelines/
├── test/                      # CLI tests
├── UPSTREAM.md                # Vercel-sourced skills: local patches, sync steps
├── README.md
├── LICENSE
└── CHANGELOG.md
```

Every skill folder contains `SKILL.md`, which indexes that skill's `references/` or `rules/` files. `npm test` runs `react-frontend-skills lint`, which fails on unindexed rule files, broken links, stale rule counts, and descriptions over the pack-wide resident budget (280 tokens, 120 words, 15 list items across all skills).

## Usage

Once installed, skills activate when your agent picks up a matching task:

```typescript
// "Create a Next.js page with data fetching"  → nextjs, react, tanstack-query
// "Build a form with validation"              → react-hook-form, zod, shadcn
// "Write tests for this component"            → vitest, tdd, msw
```

You can also read the guidelines yourself:

```bash
cat skills/react/SKILL.md
cat skills/nextjs/references/cache-use-cache-directive.md
```

## Contributing

Contributions are welcome.

1. Fork the repo
2. Add a skill folder under `skills/your-skill/` with `SKILL.md` and its `references/` or `rules/` files
3. Run `npm test`. CI runs it on every pull request
4. Open a pull request

Improving an existing skill counts just as much. New rules, corrections, version bumps: open a PR. For the three Vercel-sourced skills, follow [UPSTREAM.md](UPSTREAM.md) so upstream syncs keep this repo's patches.

## License

MIT, 2026 [Mohamed Elkholy](https://github.com/PyModel). See [LICENSE](LICENSE).

---

<p align="center">
  If this saved you some time, a star helps other people find it.
</p>

<p align="center">
  Built and maintained by <strong>elkaix</strong> · <a href="https://github.com/elkaix">@elkaix</a>
</p>
