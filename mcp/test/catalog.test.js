import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { loadCatalog } from '../src/catalog.js'

const catalog = await loadCatalog()

test('loads every skill and Markdown file from the repository', () => {
  assert.equal(catalog.skills.length, 18)
  assert.equal(catalog.files.length, 738)
  assert.equal(new Set(catalog.files.map((file) => file.id)).size, catalog.files.length)

  const nextjs = catalog.getSkill('nextjs')
  assert.ok(nextjs)
  assert.match(nextjs.description, /Next\.js 16/)
  assert.match(nextjs.content, /^---\n/)
})

test('lists stable resource metadata for every Markdown file', () => {
  const resources = catalog.listResources()

  assert.equal(resources.length, catalog.files.length)
  assert.equal(new Set(resources.map((resource) => resource.uri)).size, resources.length)
  assert.ok(resources.every((resource) => resource.mimeType === 'text/markdown'))
  assert.ok(resources.some((resource) => resource.name === 'react/SKILL.md'))
})

test('search returns bounded ranked excerpts and supports an exact skill filter', () => {
  const matches = catalog.search('cache components', { skill: 'nextjs', limit: 3 })

  assert.ok(matches.length > 0)
  assert.ok(matches.length <= 3)
  assert.ok(matches.every((match) => match.skill === 'nextjs'))
  assert.equal(matches[0].path, 'references/cache-use-cache-directive.md')
  assert.ok(matches[0].line > 0)
  assert.ok(matches[0].snippet.length <= 480)
})

test('reference lookup rejects traversal and non-Markdown paths', () => {
  assert.equal(catalog.getReference('nextjs', '../package.json'), undefined)
  assert.equal(catalog.getReference('nextjs', '/etc/passwd.md'), undefined)
  assert.equal(catalog.getReference('nextjs', 'references\\cache-fetch-options.md'), undefined)
  assert.equal(catalog.getReference('nextjs', 'references/cache-fetch-options.txt'), undefined)
  assert.ok(catalog.getReference('nextjs', 'references/cache-fetch-options.md'))
})

test('configured missing directory fails with an actionable error', async () => {
  await assert.rejects(
    loadCatalog({ skillsDir: join(tmpdir(), 'react-skills-directory-that-does-not-exist') }),
    /Configured skills directory does not exist/
  )
})

test('invalid frontmatter fails during catalog loading', async (context) => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'react-skills-invalid-'))
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }))

  const skillDirectory = join(fixtureRoot, 'broken')
  await mkdir(skillDirectory)
  await writeFile(join(skillDirectory, 'SKILL.md'), '---\nname: [broken\n---\n# Broken\n')

  await assert.rejects(loadCatalog({ skillsDir: fixtureRoot }), /Invalid frontmatter/)
})
