import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { CHECKS } from '../bin/checks.mjs'
import { detect, lint, maskComments, rangeMajor, scan } from '../bin/react-frontend-skills.mjs'

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
  assert.deepEqual(scan(root), { checks: 0, skipped: 0, unknown: 0, filesScanned: 0, hits: [] })
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

test('lint accepts CRLF frontmatter', (context) => {
  const root = fixture(context, { 'skills/demo/SKILL.md': '---\r\nname: demo\r\ndescription: Demo skill.\r\n---\r\n# Demo\r\n' })
  assert.deepEqual(lint(join(root, 'skills')).errors, [])
})

test('only ranges that pin one major decide the major', () => {
  const cases = {
    '19': 19, '^19.1.0': 19, '~19.1': 19, '19.x': 19, '=19.0.0': 19, 'v19.0.0': 19, '16.0.0-canary.3': 16,
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
  const result = scan(root)
  assert.ok(result.unknown > 0, 'msw checks need a known version')
  assert.equal(result.skipped, 0, 'unknown versions are not reported as predating checks')
})

test('scan reports the line of the match, not of preceding blank lines', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { next: '16.4.0' } },
    'next.config.ts': '// cacheComponents: false\nexport default { cacheComponents: true }\n',
    'app/page.tsx': "import x from 'x'\n\n\n\nexport const dynamic = 'force-dynamic'\n",
  })
  assert.deepEqual(scan(root).hits.map((hit) => `${hit.file}:${hit.line}`), ['app/page.tsx:5'])
  writeFileSync(join(root, 'next.config.ts'), '// cacheComponents: true\nexport default {}\n')
  assert.deepEqual(scan(root).hits, [], 'a commented-out flag does not enable the check')
})

test('comment masking keeps strings, offsets and markup rules', () => {
  const js = "fetch('https://api.example.com') // z.nativeEnum(R)\nconst s = \"/* not a comment */\"\n/* a\nb */ x"
  const masked = maskComments(js, 'a.ts')
  assert.equal(masked.length, js.length)
  assert.match(masked, /fetch\('https:\/\/api\.example\.com'\) +\n/)
  assert.match(masked, /"\/\* not a comment \*\/"/)
  assert.match(masked, /^ +\n +x$/m)
  assert.equal(maskComments("<p>Don't</p> // keep\nz.nativeEnum(R) // drop", 'a.tsx').split('\n')[1].trimEnd(), 'z.nativeEnum(R)')
  assert.equal(maskComments('a { background: url(https://x.dev/a.png) }', 'a.css'), 'a { background: url(https://x.dev/a.png) }')
  assert.equal(maskComments('<!-- bg-opacity-50 --><b>', 'a.html'), '                      <b>')
})

test('scan ignores trailing and block comments and finds code after a URL', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { zod: '^4.1.0' } },
    'src/a.ts': [
      "import { z } from 'zod'",
      'const a = 1 // z.nativeEnum(R)',
      '/*',
      'z.nativeEnum(R)',
      '*/',
      "const u = 'https://x.dev'; z.nativeEnum(R)",
      '',
    ].join('\n'),
  })
  assert.deepEqual(scan(root).hits.map((hit) => hit.line), [6])
})

test('check patterns match the removed API and leave current code alone', () => {
  const pattern = (id) => {
    const check = CHECKS.find((candidate) => candidate.id === id)
    assert.ok(check, id)
    return new RegExp(check.pattern.source, `${check.pattern.flags}m`)
  }
  const cases = [
    ['tw4-leading-important-modifier', 'cn("p-2", "!flex")', true],
    ['tw4-leading-important-modifier', 'clsx("a", cond && "!mt-0 b")', true],
    ['tw4-leading-important-modifier', 'cn("a", !open && "b")', false],
    ['tw4-leading-important-modifier', 'cn("flex!")', false],
    ['tw4-leading-important-modifier', "cn(getBase(foo(bar)), '!flex')", true],
    ['tw4-opacity-utilities-removed', 'class="border-opacity-50 ring-opacity-25"', true],
    ['tw4-opacity-utilities-removed', 'class="divide-opacity-50"', true],
    ['tw4-opacity-utilities-removed', 'class="placeholder-opacity-50"', true],
    ['tw4-opacity-utilities-removed', 'class="bg-black/50"', false],
    ['zod4-string-format-methods', 'z.string().min(1, "a (b)").email()', true],
    ['zod4-string-format-methods', 'z.string({ error: "x" }).email()', true],
    ['zod4-string-format-methods', 'z.email()', false],
    ['next16-middleware-file', "export { middleware } from './x'", true],
    ['next16-middleware-file', 'export default middleware', true],
    ['next16-middleware-file', 'export { handler as middleware }', true],
    ['next16-revalidatetag-single-arg', 'revalidateTag(getTag(x))', true],
    ['next16-revalidatetag-single-arg', "revalidateTag(getTag(x), 'max')", false],
    ['vitest5-nested-vi-mock', '  vi.hoisted<T>(() => 1)', true],
    ['msw3-graphql-root-import', "import { graphql, HttpResponse } from 'msw'", true],
    ['msw3-graphql-root-import', "import { graphql } from 'msw/graphql'", false],
    ['msw3-graphql-root-import', "import { http, HttpResponse } from 'msw'", false],
    ['msw3-on-unhandled-request-renamed', "server.listen({ onUnhandledRequest: 'error' })", true],
    ['msw3-on-unhandled-request-renamed', "server.listen({ onUnhandledFrame: 'error' })", false],
    ['msw3-graphql-link-first', "graphql.query('GetUser', resolver)", true],
    ['msw3-graphql-link-first', "api.query('GetUser', resolver)", false],
    ['msw3-connection-event-renamed', "server.events.on('connection', listener)", true],
    ['msw3-connection-event-renamed', "server.events.on('websocket:connection', listener)", false],
  ]
  for (const [id, input, expected] of cases) assert.equal(pattern(id).test(input), expected, `${id}: ${input}`)
})

test('scan runs MSW 3 checks only on MSW 3', (context) => {
  const root = fixture(context, {
    'package.json': { devDependencies: { msw: '^3.0.0' } },
    'src/mocks.ts': "import { setupServer } from 'msw/node'\nimport { graphql } from 'msw'\nsetupServer().listen({ onUnhandledRequest: 'error' })\n",
  })
  assert.deepEqual(scan(root).hits.map((hit) => `${hit.line} ${hit.rule}`).sort(), [
    '2 setup-v3-handler-entrypoints',
    '3 setup-unhandled-requests',
  ])
  writeFileSync(join(root, 'package.json'), JSON.stringify({ devDependencies: { msw: '^2.15.0' } }))
  assert.deepEqual(scan(root).hits, [])
})

test('comment masking terminates on unclosed openers and masks only their line', () => {
  for (const [text, file] of [[' /* x', 'a.ts'], ['\n/* unclosed', 'a.css'], ['xx<!-- x', 'a.html'], ['/*', 'a.ts']]) {
    assert.equal(maskComments(text, file).length, text.length, `${file}: ${JSON.stringify(text)}`)
  }
  assert.equal(maskComments('const sep = /[/*]/\nconst x = z.nativeEnum(R)', 'a.ts').split('\n')[1], 'const x = z.nativeEnum(R)')
  assert.equal(maskComments('Put pages in app/*\n\n<div className="!flex" />', 'a.mdx').split('\n')[2], '<div className="!flex" />')
})

test('line comments count in tsconfig, scss and html scripts; mid-line // in css stays text', () => {
  assert.equal(maskComments('{\n  // "baseUrl": "."\n}', 'tsconfig.json').includes('baseUrl'), false)
  assert.equal(maskComments('// @tailwind base;', 'a.scss').trim(), '')
  assert.equal(maskComments('<script>\n// bg-opacity-50\n</script>', 'a.html').includes('opacity'), false)
  assert.equal(maskComments('// @tailwind base;', 'a.css').trim(), '', 'a line-start // is still a comment')
})

test('scan keeps root dotfiles in git repos and ignores oversized config files', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { tailwindcss: '^4.1.0' } },
    '.postcssrc.json': '{ "plugins": { "@tailwindcss/postcss": {}, "autoprefixer": {} } }',
  })
  spawnSync('git', ['init', '-q'], { cwd: root })
  assert.deepEqual(scan(root).hits.map((hit) => hit.file), ['.postcssrc.json'])

  const next = fixture(context, {
    'package.json': { dependencies: { next: '16.4.0' } },
    'next.config.ts': `export default { cacheComponents: true }\n${' '.repeat(600 * 1024)}`,
    'app/page.tsx': "export const dynamic = 'force-dynamic'\n",
  })
  assert.deepEqual(scan(next).hits, [], 'a config over MAX_FILE_BYTES is not read')
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

test('npm 6 lockfiles resolve versions from the root dependencies tree', (context) => {
  const root = fixture(context, {
    'package.json': { dependencies: { zod: 'latest' } },
    'package-lock.json': { lockfileVersion: 1, dependencies: { zod: { version: '4.6.7' } } },
  })
  assert.deepEqual([detect(root)[0].installed, detect(root)[0].status], ['4.6.7', 'ok'])
})

test('checks ruled out by a project config flag are not counted as unknown', (context) => {
  const files = { 'package.json': { dependencies: { next: 'latest' } } }
  const without = scan(fixture(context, files)).unknown
  const withFlag = scan(fixture(context, { ...files, 'next.config.ts': 'export default { cacheComponents: true }' })).unknown
  assert.equal(withFlag - without, 1, 'only the config-enabled check adds to the unknown count')
})

test('comment masking handles regex literals, template expressions and CSS url()', () => {
  const masked = (text, file = 'a.ts') => maskComments(text, file)
  assert.equal(masked('const r = /[//]/; z.nativeEnum(R)'), 'const r = /[//]/; z.nativeEnum(R)')
  assert.equal(masked('const half = a / 2 // z.nativeEnum(R)').trimEnd(), 'const half = a / 2')
  assert.equal(masked("x = 'a' / 2 // drop").trimEnd(), "x = 'a' / 2")
  assert.equal(masked('`a ${x // z.nativeEnum(R)\n} b` // drop').includes('nativeEnum'), false)
  assert.equal(masked('`${ {a: 1}.a } // keep`'), '`${ {a: 1}.a } // keep`')
  assert.equal(masked('a { b: url(http://x.dev/a.png) } // drop', 'a.scss').trimEnd(), 'a { b: url(http://x.dev/a.png) }')
  // A slash after JSX or template braces is markup, not a regex, so the comment after it still masks.
  assert.equal(masked('<Foo a={b} /> {/*\n  z.nativeEnum(R)\n*/}\nconst ok = 1', 'a.tsx').includes('nativeEnum'), false)
  assert.equal(masked('return <Foo {...props} /> // z.nativeEnum(R)', 'a.jsx').includes('nativeEnum'), false)
  assert.equal(masked('<p>{done}/{total} {/* z.nativeEnum(R) */}</p>', 'a.tsx').includes('nativeEnum'), false)
  assert.equal(masked('<span>{{a}}/{{b}} <!-- z.nativeEnum --></span>', 'a.vue').includes('nativeEnum'), false)
  assert.equal(masked('<style>\n.a { background: url(/bg.png); } /* legacy\n  .b { @apply !flex }\n*/\n</style>', 'a.vue').includes('!flex'), false)
  assert.equal(masked('x = /a/* 2 // z.nativeEnum(R)').includes('nativeEnum'), false)
  assert.equal(masked('return /[/*]/\nz.nativeEnum(R)\n// */').split('\n')[1], 'z.nativeEnum(R)')
  assert.equal(masked('const total = sum.return / 2 // drop').trimEnd(), 'const total = sum.return / 2')
  for (const text of ['/', 'x = /', '`${', '`${ /[ ', 'url(', 'a { b: url(http:// }']) {
    for (const file of ['a.ts', 'a.scss']) assert.equal(masked(text, file).length, text.length, `${file}: ${text}`)
  }
})

test('comment masking stays linear on hostile input', () => {
  const inputs = [
    ['x /*\n', 'a.ts'], ['<!--\n', 'a.html'], ['= /[', 'a.ts'], ['url(a\n', 'a.scss'],
    ['url(a) ', 'a.scss'], ['a//', 'a.css'], ['a/*', 'a.md'], ['${', 'a.ts'],
  ]
  for (const [unit, file] of inputs) {
    const text = unit.repeat(Math.ceil(400_000 / unit.length))
    const started = performance.now()
    maskComments(text, file)
    assert.ok(performance.now() - started < 1000, `${file} ${JSON.stringify(unit)} took ${Math.round(performance.now() - started)}ms`)
  }
})

test('brace-list patterns stay fast on unclosed braces', () => {
  for (const check of CHECKS) {
    const input = 'import {graphql export {middleware import {rest '.repeat(10000)
    const pattern = new RegExp(check.pattern.source, [...new Set(`${check.pattern.flags}gm`)].join(''))
    const started = performance.now()
    for (const _ of input.matchAll(pattern)) void _
    assert.ok(performance.now() - started < 1000, `${check.id} took ${Math.round(performance.now() - started)}ms`)
  }
})

test('cli exits 2 on usage errors and 0 on help', () => {
  assert.equal(spawnSync(process.execPath, [cli, 'bogus']).status, 2)
  assert.equal(spawnSync(process.execPath, [cli, 'scan', '--skill']).status, 2)
  assert.equal(spawnSync(process.execPath, [cli, '--help']).status, 0)
})
