<h1 align="center">React Frontend Skills</h1>

<p align="center">
  <strong>Production-grade AI agent skills for the modern React ecosystem, by PyModel</strong>
</p>

<p align="center">
  <a href="https://github.com/PyModel/react-frontend-skills/stargazers"><img src="https://img.shields.io/github/stars/PyModel/react-frontend-skills?style=flat&logo=github&logoColor=white&color=f5c518&labelColor=1c1c1c" alt="Stars" /></a>
  <a href="https://github.com/PyModel/react-frontend-skills/network/members"><img src="https://img.shields.io/github/forks/PyModel/react-frontend-skills?style=flat&logo=github&logoColor=white&color=4f8cc9&labelColor=1c1c1c" alt="Forks" /></a>
  <a href="https://github.com/PyModel/react-frontend-skills/issues"><img src="https://img.shields.io/github/issues/PyModel/react-frontend-skills?style=flat&logo=github&logoColor=white&color=e07b39&labelColor=1c1c1c" alt="Issues" /></a>
  <a href="https://www.npmjs.com/package/@pymodel/react-frontend-skills"><img src="https://img.shields.io/npm/v/@pymodel/react-frontend-skills?style=flat&logo=npm&logoColor=white&color=cb3837&labelColor=1c1c1c" alt="npm" /></a>
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

Tired of your agent being dumb, especially with React? This skill pack is the solution. It will make your agent even dumber!!!!!!!!! haha, I mean: try it first, then judge. <3 If it works out for you, drop a star.

## What is this?

React Frontend Skills is a collection of 18 AI agent skills for the React ecosystem. Drop them into your coding assistant and it starts applying real patterns for performance, UI, testing, data, and architecture instead of whatever it remembered from 2023.

Each skill is a portable `SKILL.md` folder, usually with detailed `references/` or `rules/` and often an `AGENTS.md` index. The layout follows the open agent-skills convention, so it works across major AI coding agents.

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
<summary><strong>Pythinker and any other AGENTS.md-aware agent (manual)</strong></summary>

Every skill ships a standard `SKILL.md`, and many also include an `AGENTS.md` index. Agents that read local instruction files can consume those directly, no CLI required:

```bash
# Clone once
git clone https://github.com/PyModel/react-frontend-skills.git

# Point your agent at the skills directory, or copy what you need
cp -r react-frontend-skills/skills/react   ./.agent/skills/
cp -r react-frontend-skills/skills/nextjs  ./.agent/skills/
```

Then reference `skills/<name>/SKILL.md` from your agent context, plus `AGENTS.md` where present. This is the path for Pythinker and custom in-house agents.

</details>

<details>
<summary><strong>Full list of 77 supported agents</strong></summary>

The `skills` CLI 1.5.23 supports 77 agents, among them Claude Code, Codex, Cursor, OpenCode, Pi, Kiro CLI, GitHub Copilot, Gemini CLI, Windsurf, Cline, Roo, Goose, Kilo, Droid, Antigravity, Trae, Warp, Zed, Continue, and Qwen Code. Run `npx skills add PyModel/react-frontend-skills` with no agent flag and it detects yours.

</details>

## Skills included

### Audited version baseline

This repository contains guidance, not runtime dependencies. The last maintenance pass was checked on 2026-08-20 against these package and documentation lines:

| Area | Audited line |
| --- | --- |
| React | 19.2 (`react` 19.2.8) |
| Next.js | 16.3 (`next` 16.3.1) |
| TypeScript | 7.0 (`typescript` 7.0.2) |
| Tailwind CSS | 4.3 (`tailwindcss` 4.3.3) |
| Vitest | 4.1 (`vitest` 4.1.11) |
| Playwright | 1.62 (`@playwright/test` 1.62.1) |
| MSW | 2.15 (`msw` 2.15.0) |
| TanStack Query | 5.x (`@tanstack/react-query` 5.101.4) |
| React Hook Form | 7.x (`react-hook-form` 7.85.0) |
| Zod | 4.4 (`zod` 4.4.3) |
| nuqs | 2.10 (`nuqs` 2.10.0) |

If your project pins a different version, trust that version's official docs over this baseline.

### Core framework

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [react](skills/react) | 40 | React 19 concurrent rendering, Server Components, hook optimization |
| [nextjs](skills/nextjs) | 40 | Next.js 16 App Router, caching, server components, routing |
| [typescript](skills/typescript) | 44 | TypeScript 7 migration, compiler config, type safety, async patterns |

### UI and styling

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [tailwind](skills/tailwind) | 42 | Tailwind CSS v4 optimization, utility patterns, theming |
| [shadcn](skills/shadcn) | 42 | shadcn/ui with Radix or Base UI primitives, accessibility |
| [ui-design](skills/ui-design) | 42 | UI and UX practices, accessibility, responsive design |
| [web-design-guidelines](skills/web-design-guidelines) | dynamic | Fetches the current upstream web interface guidelines |

### Data and state

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [tanstack-query](skills/tanstack-query) | 40 | Data fetching, caching, mutations, optimistic updates |
| [react-hook-form](skills/react-hook-form) | 41 | Form validation, performance, field arrays |
| [zod](skills/zod) | 43 | Schema validation, type inference, error handling |
| [nuqs](skills/nuqs) | 42 | Type-safe URL query state for Next.js |

### Testing

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [vitest](skills/vitest) | 44 | Vitest 4 setup, mocking, async testing, worker pools |
| [playwright](skills/playwright) | 43 | End-to-end testing, selectors, authentication, CI |
| [msw](skills/msw) | 45 | API mocking with Mock Service Worker |
| [tdd](skills/tdd) | 42 | Test-driven development methodology |

### Architecture and practices

| Skill | Rules | What it covers |
| ----- | ----- | -------------- |
| [feature-arch](skills/feature-arch) | 42 | Feature-based architecture, module organization |
| [vercel-composition-patterns](skills/vercel-composition-patterns) | 7 | React composition patterns |
| [vercel-react-best-practices](skills/vercel-react-best-practices) | 57 | React performance optimization |

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
├── README.md
├── LICENSE
└── CHANGELOG.md
```

Every skill folder contains `SKILL.md`. Most include a `references/` or `rules/` directory, many include an `AGENTS.md` index, and some include `metadata.json`. `SKILL.md` links the files that belong to that skill.

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
2. Add a skill folder under `skills/your-skill/` with `SKILL.md` and any supporting `references/`, `rules/`, or metadata it needs
3. Open a pull request

Improving an existing skill counts just as much. New rules, corrections, version bumps: open a PR.

## License

MIT, 2026 [Mohamed Elkholy](https://github.com/PyModel). See [LICENSE](LICENSE).

---

<p align="center">
  If this saved you some time, a star helps other people find it.
</p>

<p align="center">
  Built and maintained by <strong>elkaix</strong> · <a href="https://github.com/elkaix">@elkaix</a>
</p>
