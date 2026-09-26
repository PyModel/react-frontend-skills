# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2026-09-26

### Added

- `scan` checks for three Vitest 5 hard breaks (31 checks, up from 28):
  - `vitest5-removed-entrypoints`: imports from `vitest/suite`, `runners`, `coverage`, `snapshot`, `reporters`, `environments` or `mocker`.
  - `vitest5-nested-vi-mock`: `vi.mock`, `vi.unmock` or `vi.hoisted` below module top level, which fails the whole file.
  - `vitest5-tothrow-empty-string`: `toThrow('')`, which now matches any message.

### Fixed

- vercel-react-best-practices `rendering-hydration-no-flicker`: the inline-script example adds `suppressHydrationWarning`. Without it, React 19 logs an attribute mismatch. Recorded as a local patch in `UPSTREAM.md`.

## [2.2.0] - 2026-09-26

### Added

- Eight rules for the September 2026 releases:
  - zod: `perf-compile-schemas` (`z.compile`, `z.withParser`) and `parse-validate-for-boolean-checks` (`.validate()`).
  - vitest: `perf-bench-test-context`, the Vitest 5 `bench` fixture.
  - react: `effect-use-browser-only`, React 19.3 `use(browser())`.
  - playwright: `loc-frame-locator`.
  - react-hook-form: `valid-trigger-should-touch` and `adv-opaque-types`.
  - tanstack-query: `prefetch-infinite-query` (`queryClient.infiniteQuery`).

### Changed

- Zod 4.5/4.6: `.exactPartial()`, `z.iban()`, ISO datetimes that require seconds, code-point string lengths, lazily built error messages, numeric-enum `.options`.
- Vitest 5:
  - `vi.mock` only at top level.
  - Inline projects inherit the root config.
  - Reports under `.vitest/`.
  - Removed entry points; `vite` is a peer dependency.
  - No config lookup in parent directories.
  - `toThrow('')` matches any message.
  - `expect.poll` fails when its timeout expires.
- React 19.3: the development warning for skipping `use()`, and transitions that commit independently. Next.js hydration and `next/dynamic` rules point to `use(browser())`.
- Playwright 1.63: test locks for tests that share a resource, `locator.visible()`, aria snapshots in traces, step subtitles and params.
- React Hook Form: built-in `<ErrorMessage>` (7.88) and `getErrors()` (7.86) replace the lodash `get` pattern.
- TanStack Query: `mutate()` without variables (5.102).

### Fixed

- `perf-sharding`:
  - The coverage merge lacked `--reporter=blob`.
  - Nothing uploaded the shard blobs.
  - It missed the `.vitest` hidden-directory flag.
- `setup-restore-mocks`: the intro claimed restoring resets `vi.fn()` mocks.
- `env-per-file-override`: the node project also ran component and hook tests.
- `assert-specific-matchers`: suggested `toBeEmpty()`, which is not a Vitest matcher, and `expect.any(String)` as a plain matcher.
- The `getFieldState` example did not compile.
- TanStack snippets used `noop` without importing it.
- `build-dynamic-imports` used `ssr: false` without `'use client'`.
- The `useTransition` example claimed synchronous filtering was interruptible.
- `useSyncExternalStore` resubscribed on every render.
- Comments on Playwright workers and `trace: 'on-first-retry'` were misleading.
- `LICENSE` names PyModel; the 2.1.0 tarball shipped the pre-rebrand notice.

## [2.1.0] - 2026-09-26

### Added

- Added the separately publishable `@pymodel/react-frontend-skills-mcp` stdio server with read-only tools and resources for all skill documentation.
- Added the zero-dependency `react-frontend-skills` CLI: `detect` (installed versions vs. each skill's target major), `scan` (deprecated/removed API usage mapped to rule IDs), and `lint` (skill frontmatter, indexes, links, rule counts, scan-rule integrity). `npm test` runs it.
- CI workflow: `npm test` and the MCP check on Node 20 and 24 for every push to `main` and every pull request.
- `UPSTREAM.md`: the three Vercel-sourced skills, their upstream commits, the seven local rule patches, and the sync procedure.

### Changed

- Cut every skill description to one line of at most 8 words, led by the library and major version. Across all 18 skills: 1,342 → 251 resident tokens, 677 → 113 words, 124 → 3 comma-separated items. Dropped "(formerly …)" aliases, "This skill should be used when" boilerplate, keyword lists, and cross-skill boundary notes already carried by each body's Related Skills section. `lint` enforces the pack-wide budget (280 tokens, 120 words, 15 list items). A 36-prompt trigger eval showed no recall loss: prompts that don't name the library went from 13/16 to 16/16, named prompts stayed 12/12, and no negative prompt triggered a skill.
- Normalized every rule-based skill's "How to Use" section and removed dead "Full Compiled Document" / "Reference Files" pointers.
- MCP tests and packaging scripts derive skill and file counts from disk instead of hardcoding them.
- README rule counts now match the files on disk and are enforced by `lint`.
- Re-audited the version baseline against React 19.3, Next.js 16.3.6, Vitest 5.0.2, Playwright 1.63, TanStack Query 5.104, React Hook Form 7.89, Zod 4.6.5 and nuqs 2.10.1. The README states what the audit covered.
- `web-design-guidelines` fetches `command.md` from a pinned, reviewed upstream commit instead of `main`.
- README cleanup: dropped the stale agent count and CLI version, and the leftover `AGENTS.md` and `metadata.json` mentions.

### Fixed

- Rule examples that contradicted other rules or current APIs: Zod refinements used the deprecated `message` param (now `error`); `perf-zod-mini` showed `z.string().email()`; `import-path-aliases` recommended `baseUrl`, which TypeScript 7 removed; TanStack Query's server prefetch examples read Next.js `params` synchronously; Playwright used the deprecated `waitForNavigation()`; MSW claimed `request.body` is `undefined` in v2 (it is a stream); shadcn named the pre-rename `@base-ui-components/react` package; two Vercel rules called `useEffectEvent` "stable" (react.dev: its identity changes every render); the Tailwind CLI rule did not explain why `tailwindcss` in npm scripts still works.
- TanStack Query prefetch examples use `queryClient.query(options).catch(noop)`; 5.102 deprecated `prefetchQuery`, `fetchQuery` and `ensureQueryData`.
- Vitest 5 rules: `clearMocks` now defaults to `true`, unawaited assertions fail the test, `page` comes from `vitest/browser`, the migration rule named a nonexistent `@vitest/istanbuljs` package and `--no-cache` flag, `restoreAllMocks`/`resetAllMocks` behaviour was described backwards, and the `perf-disable-isolation` project examples lacked the `test` wrapper.
- Zod `object-partial-for-updates` said Zod 4 removed `deepPartial()`; Zod 4.5 added `z.deepPartial(schema)`.
- `bundle-barrel-imports` and `async-defer-await` re-synced with upstream: they recommend `optimizePackageImports` over untyped `lucide-react` deep imports, and link the cheap-condition rule.

### Removed

- Per-skill `AGENTS.md` files. Thirteen were tables of contents duplicating `SKILL.md` while claiming to be "all rules expanded"; the two Vercel compiled guides were stale (57 of 70 and 7 of 8 rules) and predated this repo's local rule patches. `SKILL.md` is the single index.
- Per-skill `metadata.json` files. The `skills` CLI excludes them at install time, so the links to them were dead for installed users, and their rule counts had drifted.
- Ten `_sections.md` / `_template.md` files that no `SKILL.md` linked; each duplicated its skill's category table. `lint` now rejects any unlinked Markdown file in `references/` or `rules/`.

## [2.0.1] - 2026-08-20

### Changed

- Audited all 18 skills against current official documentation and the August 2026 package baseline.
- Updated Next.js 16 caching/Turbopack guidance, TypeScript 7 migration notes, Zod 4 APIs, nuqs 2 rate limiting, Vitest 4 requirements, Playwright readiness guidance, Tailwind CSS 4 integration, and shadcn Radix/Base UI scope.
- Replaced unsupported impact estimates with project-specific measurement guidance and repaired stale official links.
- Updated repository metadata for the `PyModel/react-frontend-skills` location.
- Changed the canonical npm package scope to `@pymodel/react-frontend-skills`.

## [2.0.0] - 2026-06-20

### Changed

- 🏷️ **Rebranded to React Frontend Skills** under the **Pythoughts** organization,
  authored and maintained by **Mohamed Elkholy**.
- 📦 Repository moved to `Pythoughts-labs/react-frontend-skills`; all install
  commands and links updated accordingly.
- 📄 Licensed under MIT © 2026 Mohamed Elkholy (see `LICENSE`).

### Added

- 🤖 **Per-agent install matrix** in the README for Claude Code, Codex, Cursor,
  OpenCode, Pi, and Kiro CLI, plus a manual path for Pythinker and any
  AGENTS.md-aware agent.
- `.gitignore` for OS/editor/Node artifacts.

## 1.1.0 - 2026-01-28

### Added

- 🎉 **9 New Skills** - Expanded from 10 to 19 skills total
  - **react** - React 19 concurrent rendering, Server Components, hooks optimization (40+ rules)
  - **react-hook-form** - Form validation and performance patterns (41+ rules)
  - **zod** - Schema validation, type inference, and error handling (43+ rules)
  - **nuqs** - Type-safe URL query state management for Next.js (42+ rules)
  - **playwright** - E2E testing best practices for Next.js (43+ rules)
  - **msw** - Mock Service Worker API mocking patterns (45+ rules)
  - **feature-arch** - Feature-based architecture guidelines (42+ rules)
  - **tdd** - Test-Driven Development methodology (42+ rules)
  - **ui-design** - UI/UX and frontend design best practices (42+ rules)

### Changed

- 📝 **Complete README Overhaul**
  - Professional design with badges and visual elements
  - Categorized skills by function (Core Framework, UI & Styling, Data Management, Testing, Architecture)
  - Added impact priority table (CRITICAL, HIGH, MEDIUM, LOW)
  - Improved quick start guide with `--all` flag documentation
  - Enhanced project structure visualization
  - Added 33+ supported AI agents list with expandable details
  - Better usage examples and code snippets

### Improved

- ⚡ **Simplified Installation** - Added `--all` flag support for one-command installation:
  ```bash
  npx skills add Pythoughts-labs/react-frontend-skills --all
  ```
- 📊 **Better Organization** - Skills now grouped into 5 clear categories
- 🎨 **Enhanced Presentation** - Professional badges, emojis, and formatting
- 📚 **Comprehensive Coverage** - Now covers entire React ecosystem from architecture to testing

### Documentation

- Added detailed skill descriptions with rule counts
- Included "Why React Agent Skills?" section with key benefits
- Added collapsible section for full agent compatibility list
- Enhanced contributing guide with clear examples
- Updated acknowledgments with new skill sources

## 1.0.0 - 2026-01-27

### Added

- Initial release of React Agent Skills repository
- Complete README documentation in English
- 9 comprehensive skill collections:
  - **Next.js 16 App Router** - 40+ performance optimization rules
  - **TypeScript** - 42+ optimization rules for compilation and type checking
  - **Vitest** - 44+ testing patterns and best practices
  - **ShadCN UI** - Component patterns and accessibility guidelines
  - **Tailwind CSS** - Utility-first CSS patterns
  - **TanStack Query** - Data fetching and caching strategies
  - **Vercel Composition Patterns** - React composition patterns
  - **Vercel React Best Practices** - React best practices
  - **Web Design Guidelines** - UI/UX design principles
- Detailed project structure documentation
- Installation and usage instructions for AI coding assistants
- Code examples and scenarios for each major skill
- Contributing guidelines for community contributions

### Documentation

- Complete README with installation, usage, and contribution guides
- Project structure overview with detailed file organization
- Example scenarios for Next.js, TypeScript, and Vitest
- Priority-based skill organization (CRITICAL, HIGH, MEDIUM, LOW)
- Category-based rule grouping for easy navigation

[Unreleased]: https://github.com/PyModel/react-frontend-skills/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/PyModel/react-frontend-skills/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/PyModel/react-frontend-skills/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/PyModel/react-frontend-skills/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/PyModel/react-frontend-skills/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/PyModel/react-frontend-skills/releases/tag/v2.0.0
