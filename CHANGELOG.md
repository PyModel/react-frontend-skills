# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Audited all 18 skills against current official documentation and the August 2026 package baseline.
- Updated Next.js 16 caching/Turbopack guidance, TypeScript 7 migration notes, Zod 4 APIs, nuqs 2 rate limiting, Vitest 4 requirements, Playwright readiness guidance, Tailwind CSS 4 integration, and shadcn Radix/Base UI scope.
- Replaced unsupported impact estimates with project-specific measurement guidance and repaired stale official links.
- Updated repository metadata for the `PyModel/react-frontend-skills` location.

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

[2.0.0]: https://github.com/PyModel/react-frontend-skills/releases/tag/v2.0.0
