import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { detect, lint, scan } from '../bin/react-frontend-skills.mjs'

const cli = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'react-frontend-skills.mjs')

function fixture(context, files) {
  const root = mkdtempSync(join(tmpdir(), 'rfs-cli-'))
  context.after(() => rmSync(root, { recursive: true, force: true }))
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), typeof content === 'string' ? content : JSON.stringify(content))
  }
  return root
}

test('repository skills pass lint', () => {
  assert.deepEqual(lint().errors, [])
})

test('lint rejects unindexed rules, stale counts, broken links, and unsafe descriptions', (context) => {
  const root = fixture(context, {
    'skills/demo/SKILL.md':
      '---\nname: demo\ndescription: Demo: an unquoted colon\n---\n# Demo\n\nContains 3 rules.\n\n- `a-one`\n\nSee [missing](references/nope.md).\n',
    'skills/demo/references/a-one.md': '# One\n',
    'skills/demo/references/a-two.md': '# Two\n',
    'skills/demo/references/_sections.md': '# Sections\n',
  })
  const { errors } = lint(join(root, 'skills'))
  assert.ok(errors.some((error) => error.includes('quote it')))
  assert.ok(errors.some((error) => error.includes('references/a-two.md is not indexed')))
  assert.ok(errors.some((error) => error.includes('references/_sections.md is not indexed')))
  assert.ok(errors.some((error) => error.includes('claims 3 rules, found 2')))
  assert.ok(errors.some((error) => error.includes('broken link references/nope.md')))
})

test('lint caps the resident description budget across the whole pack', (context) => {
  const long = 'word, '.repeat(300).trim()
  const root = fixture(context, { 'skills/demo/SKILL.md': `---\nname: demo\ndescription: ${long}\n---\n# Demo\n` })
  const { errors } = lint(join(root, 'skills'))
  assert.ok(errors.some((error) => error.includes('resident tokens')))
  assert.ok(errors.some((error) => error.includes('total 300 words')))
  assert.ok(errors.some((error) => error.includes('301 comma-separated items')))
})

test('detect prefers the installed version and flags major mismatches', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { zod: '^3.23.0', next: '^16.1.0' } },
    'node_modules/zod/package.json': { version: '3.23.8' },
    'components.json': {},
  })
  const rows = detect(root)
  assert.deepEqual(
    rows.find((row) => row.skill === 'zod'),
    { skill: 'zod', package: 'zod', range: '^3.23.0', installed: '3.23.8', target: 4, status: 'older-major' }
  )
  assert.equal(rows.find((row) => row.skill === 'nextjs').status, 'ok')
  assert.equal(rows.find((row) => row.skill === 'shadcn').installed, 'unknown')
  assert.equal(rows.some((row) => row.skill === 'react'), false)
})

test('scan skips checks for packages the project does not declare', (context) => {
  const root = fixture(context, { 'package.json': {}, 'src/a.ts': 'export const x = 1\n' })
  assert.deepEqual(scan(root), { checks: 0, skipped: 0, filesScanned: 0, hits: [] })
})

test('scan reports multi-line hits with rule ids and ignores comments', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { zod: '^4.1.0', msw: '^2.0.0' } },
    'src/schema.ts': [
      "import { z } from 'zod'",
      '// v3 used z.nativeEnum(Role); Zod 4 accepts enums in z.enum()',
      'export const email = z',
      '  .string()',
      '  .email()',
      'export const role = z.nativeEnum(Role)',
      '',
    ].join('\n'),
    'src/mocks.ts': "import {\n  setupServer,\n} from 'msw'\n",
    'node_modules/zod/index.ts': "import { z } from 'zod'\nz.nativeEnum(X)\n",
  })
  const hits = scan(root).hits.map(({ file, line, skill, rule }) => `${file}:${line} ${skill}/${rule}`)
  assert.deepEqual(hits.sort(), [
    'src/mocks.ts:1 msw/setup-server-node-entrypoint',
    'src/schema.ts:6 zod/schema-use-enums',
  ])
})

test('scan flags Vitest 5 hard breaks without flagging legal v5 code', (context) => {
  const root = fixture(context, {
    'package.json': { devDependencies: { vitest: '^5.0.0' } },
    'src/a.test.ts': [
      "import { vi, test, expect } from 'vitest'",
      "import { createTaskCollector } from 'vitest/suite'",
      "import { page } from 'vitest/browser'",
      "import { MockerRegistry } from '@vitest/mocker'",
      '',
      "vi.mock('./top-level')",
      'const mocks =',
      '  vi.hoisted(() => ({ fetch: vi.fn() }))',
      "test('x', async () => {",
      "  vi.mock('./nested')",
      '  const { h } = await vi.hoisted(async () => ({ h: 1 }))',
      "  vi.doMock('./per-test')",
      '  vi.mocked(fn)',
      "  // vi.mock('./commented')",
      "  expect(boom).toThrow('')",
      '  expect(boom).toThrowError("")',
      '  expect(boom).toThrow()',
      '  expect(boom).toThrow(/^$/)',
      '})',
      '',
    ].join('\n'),
  })
  const hits = scan(root).hits.map(({ line, rule }) => `${line} ${rule}`)
  assert.deepEqual(hits.sort(), [
    '10 mock-vi-mock-hoisting',
    '11 mock-vi-mock-hoisting',
    '15 assert-specific-matchers',
    '16 assert-specific-matchers',
    '2 setup-vitest5-migration',
  ])

  writeFileSync(join(root, 'package.json'), JSON.stringify({ devDependencies: { vitest: '^4.1.0' } }))
  assert.deepEqual(scan(root).hits, [], 'v5-only checks are skipped on Vitest 4')
})

test('scan gates on the lower of declared and hoisted majors and honors .gitignore', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { tailwindcss: '^3.4.0' } },
    'node_modules/tailwindcss/package.json': { version: '4.1.0' },
    'app.css': '@tailwind base;\n',
    'vendor/copy/app.css': '@tailwind base;\n',
    '.gitignore': 'vendor/\n',
  })
  assert.equal(detect(root)[0].status, 'range-mismatch')
  assert.deepEqual(scan(root).hits, [])

  writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: { tailwindcss: '^4.1.0' } }))
  spawnSync('git', ['init', '-q'], { cwd: root })
  assert.deepEqual(scan(root).hits.map((hit) => hit.file), ['app.css'])
})

test('scan gates checks on the installed major, npm aliases, and project flags', (context) => {
  const root = fixture(context, {
    'package.json': {
      dependencies: { zod: '^3.23.0', next: '^16.0.0' },
      devDependencies: { '@typescript/native': 'npm:typescript@^7.0.2', typescript: 'npm:@typescript/typescript6@^6.0.2' },
    },
    'src/a.ts': "import { z } from 'zod'\nz.nativeEnum(Role)\n",
    'tsconfig.json': '{ "compilerOptions": { "baseUrl": "." } }',
    'app/page.tsx': "export const dynamic = 'force-dynamic'\n",
  })
  const result = scan(root)
  assert.ok(result.skipped >= 6, 'zod 4 checks are skipped on zod 3')
  assert.deepEqual(
    result.hits.map((hit) => hit.rule),
    ['tscfg-typescript-7'],
    'segment config is legal without cacheComponents; TS 7 resolves through the npm alias'
  )

  writeFileSync(join(root, 'next.config.ts'), 'export default { cacheComponents: true }\n')
  assert.ok(scan(root).hits.some((hit) => hit.rule === 'cache-segment-config'))
  assert.ok(scan(root, { all: true }).hits.some((hit) => hit.rule === 'schema-use-enums'))
})

test('cli exits 2 on usage errors and 0 on help', () => {
  assert.equal(spawnSync(process.execPath, [cli, 'bogus']).status, 2)
  assert.equal(spawnSync(process.execPath, [cli, 'scan', '--skill']).status, 2)
  assert.equal(spawnSync(process.execPath, [cli, '--help']).status, 0)
})
