import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { detect, rangeMajor } from '../bin/detect.mjs'
import { headingAnchors, lint } from '../bin/lint.mjs'

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
      '---\nname: demo\ndescription: Demo: an unquoted colon\n---\n# Demo\n\nContains 3 rules.\n\n- `a-one`\n\nSee [missing](references/nope.md) and [bad anchor](references/a-one.md#missing).\n',
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
  assert.ok(errors.some((error) => error.includes('broken anchor references/a-one.md#missing')))
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

test('lint accepts CRLF frontmatter', (context) => {
  const root = fixture(context, { 'skills/demo/SKILL.md': '---\r\nname: demo\r\ndescription: Demo skill.\r\n---\r\n# Demo\r\n' })
  assert.deepEqual(lint(join(root, 'skills')).errors, [])
})

test('only ranges that pin one major decide the major', () => {
  const cases = {
    '19': 19, '^19.1.0': 19, '~19.1': 19, '19.x': 19, '19.*': 19, '19.X': 19, '=19.0.0': 19, 'v19.0.0': 19, '16.0.0-canary.3': 16,
    'npm:typescript@^7.0.2': 7, 'npm:@scope/pkg@~6.1.0': 6,
    '>=18': undefined, '^18 || ^19': undefined, '*': undefined, latest: undefined,
    'workspace:*': undefined, 'catalog:': undefined, 'npm:@typescript/typescript6': undefined, 'npm:typescript': undefined,
  }
  for (const [range, expected] of Object.entries(cases)) assert.equal(rangeMajor(range), expected, range)
})

test('detect trusts the install for open ranges and falls back to package-lock.json', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { react: '>=18', zod: 'latest', msw: 'catalog:' } },
    'node_modules/react/package.json': { version: '19.1.0' },
    'package-lock.json': { packages: { 'node_modules/zod': { version: '4.6.7' } } },
  })
  const status = Object.fromEntries(detect(root).map((row) => [row.skill, [row.installed, row.status]]))
  assert.deepEqual(status.react, ['19.1.0', 'ok'])
  assert.deepEqual(status.zod, ['4.6.7', 'ok'])
  assert.deepEqual(status.msw, [null, 'unknown-version'])
})

test('an ancestor package-lock.json counts only when it lists the project as a workspace', (context) => {
  const root = fixture(context, {
    'package-lock.json': { packages: { '': {}, 'node_modules/react': { version: '18.3.1' } } },
    'app/package.json': { dependencies: { react: 'latest' } },
  })
  assert.equal(detect(join(root, 'app'))[0].status, 'unknown-version')
  writeFileSync(
    join(root, 'package-lock.json'),
    JSON.stringify({ packages: { '': { workspaces: ['app'] }, app: {}, 'node_modules/react': { version: '19.3.1' } } })
  )
  assert.deepEqual([detect(join(root, 'app'))[0].installed, detect(join(root, 'app'))[0].status], ['19.3.1', 'ok'])
})

test('cli exits 2 on usage errors and 0 on help', () => {
  assert.equal(spawnSync(process.execPath, [cli, 'bogus']).status, 2)
  assert.equal(spawnSync(process.execPath, [cli, 'scan']).status, 2, 'scan was removed in 4.0.0')
  assert.equal(spawnSync(process.execPath, [cli, 'detect', '--all']).status, 2)
  assert.equal(spawnSync(process.execPath, [cli, 'detect', 'a', 'b']).status, 2)
  assert.equal(spawnSync(process.execPath, [cli, '--help']).status, 0)
})

test('lint checks README rule counts when the table is present', (context) => {
  const root = fixture(context, {
    'README.md': '| [demo](skills/demo) | 3 |\n',
    'skills/demo/SKILL.md': '---\nname: demo\ndescription: Demo.\n---\n# Demo\n\n- `a-one`\n',
    'skills/demo/references/a-one.md': '# One\n',
  })
  assert.ok(
    lint(join(root, 'skills')).errors.some((error) => error.includes('README.md lists 3 rules for demo'))
  )
})

test('heading anchors follow GitHub slugs: repeats, Unicode, links, emphasis, fences', () => {
  const anchors = headingAnchors(
    '# Foo\n## Foo\n## Café\n## See [docs](https://x.y)\n## _my_thing_\n```sh\n# fenced\n```\n## 1. Concurrent Rendering (conc)\n'
  )
  assert.deepEqual([...anchors], ['foo', 'foo-1', 'café', 'see-docs', 'my_thing', '1-concurrent-rendering-conc'])
})

test('lint resolves duplicate, encoded and same-file anchors', (context) => {
  const root = fixture(context, {
    'skills/demo/SKILL.md':
      '---\nname: demo\ndescription: Demo skill\n---\n# Demo\n\n## Usage\n\n[a](references/a.md#foo-1) [b](references/a.md#caf%C3%A9) [c](#usage) [d](#nope) [e](references/a.md#fenced)\n',
    'skills/demo/references/a.md': '# Foo\n## Foo\n## Café\n```\n# fenced\n```\n',
  })
  const anchors = lint(join(root, 'skills')).errors.filter((error) => error.includes('anchor'))
  assert.deepEqual(anchors, ['demo: broken anchor #nope', 'demo: broken anchor references/a.md#fenced'])
})
