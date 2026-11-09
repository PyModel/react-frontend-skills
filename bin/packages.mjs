// Skill → npm package(s) → major version the skill's guidance targets. `detect` compares the
// project's installed major against `target`; `lint` checks every skill named here exists.
export const PACKAGES = [
  { skill: 'react', packages: ['react'], target: 19 },
  { skill: 'nextjs', packages: ['next'], target: 16 },
  { skill: 'typescript', packages: ['@typescript/native', 'typescript'], target: 7 },
  { skill: 'tailwind', packages: ['tailwindcss'], target: 4 },
  { skill: 'zod', packages: ['zod'], target: 4 },
  { skill: 'tanstack-query', packages: ['@tanstack/react-query'], target: 5 },
  { skill: 'react-hook-form', packages: ['react-hook-form'], target: 7 },
  { skill: 'nuqs', packages: ['nuqs'], target: 2 },
  { skill: 'msw', packages: ['msw'], target: 3 },
  { skill: 'vitest', packages: ['vitest'], target: 5 },
  { skill: 'playwright', packages: ['@playwright/test'], target: 1 },
]
