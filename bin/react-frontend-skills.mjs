#!/usr/bin/env node
// Deterministic companion CLI for the React Frontend Skills.
// Agents run `detect` and `scan` in a user project; maintainers run `lint` in this repo.
// Zero dependencies: this file ships inside the npm package and runs through npx.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHECKS, PACKAGES } from './checks.mjs'

const SKILLS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'skills')
const SKIPPED_DIRECTORIES = new Set([
  'node_modules', '.git', '.next', '.turbo', '.vercel', '.output', 'dist', 'build', 'out',
  'coverage', 'storybook-static', 'playwright-report', 'test-results',
])
const MAX_FILE_BYTES = 512 * 1024
// Migration notes in comments name the old API on purpose; a hit there is noise.
const COMMENT_LINE = /^\s*(?:\/\/|\/\*|\*|<!--)/
const MAX_REPORTED_HITS = 200
// Every installed skill's name + description rides in the agent's system prompt on every
// message, so the budgets cap the whole pack, not each skill (tokens ≈ chars / 4).
const RESIDENT_TOKEN_BUDGET = 280
const DESCRIPTION_WORD_BUDGET = 120
const DESCRIPTION_LIST_ITEM_BUDGET = 15

const USAGE = `usage: react-frontend-skills <command> [options]

commands:
  detect [dir]                 installed library versions vs. the version each skill targets
  scan [dir] [--skill <name>]  flag deprecated or removed APIs; each hit names the rule to read
  lint [skills-dir]            maintainers: validate skill frontmatter, indexes, and scan rules

options:
  --json   machine-readable output
  --all    scan: run every check, even for packages not in package.json

exit codes: 0 clean · 1 findings or lint errors · 2 usage error`

class UsageError extends Error {}

function parseArgs(argv) {
  const options = { json: false, all: false, skill: undefined, positional: [] }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--json') options.json = true
    else if (arg === '--all') options.all = true
    else if (arg === '--skill') {
      options.skill = argv[++index]
      if (!options.skill) throw new UsageError('--skill needs a skill name')
    } else if (arg === '-h' || arg === '--help') options.help = true
    else if (arg.startsWith('-')) throw new UsageError(`unknown option: ${arg}`)
    else options.positional.push(arg)
  }
  return options
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return undefined
    throw new Error(`cannot parse ${path}: ${error.message}`)
  }
}

function projectManifest(projectDir) {
  const manifest = readJson(join(projectDir, 'package.json'))
  if (!manifest) throw new UsageError(`no package.json in ${projectDir}`)
  return manifest
}

function declaredRange(manifest, name) {
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const range = manifest[field]?.[name]
    if (range) return range
  }
  return undefined
}

// Node module resolution order: nearest node_modules first, then each ancestor (workspaces hoist).
function installedVersion(projectDir, name) {
  for (let dir = resolve(projectDir); ; dir = dirname(dir)) {
    let version
    try {
      version = readJson(join(dir, 'node_modules', name, 'package.json'))?.version
    } catch {
      // A malformed copy outside the project must not abort detection; keep resolving upward.
    }
    if (version) return version
    if (dirname(dir) === dir) return undefined
  }
}

function major(version) {
  // npm aliases ("npm:typescript@^7.0.2") carry the version after the last "@".
  const spec = version?.startsWith('npm:') ? version.slice(version.lastIndexOf('@') + 1) : version
  const match = /(\d+)(?:\.\d+)?/.exec(spec ?? '')
  return match ? Number(match[1]) : undefined
}

// The first declared package wins. An ancestor node_modules can hoist a different major than
// package.json declares, so gate on the lower of the two: a check never fires on a guess.
function resolvePackage(projectDir, manifest, packages) {
  const name = packages.find((candidate) => declaredRange(manifest, candidate))
  if (!name) return undefined
  const range = declaredRange(manifest, name)
  const installed = installedVersion(projectDir, name)
  const majors = [major(installed), major(range)].filter((value) => value !== undefined)
  return {
    name,
    range,
    installed,
    major: majors.length ? Math.min(...majors) : undefined,
    mismatch: majors.length === 2 && majors[0] !== majors[1],
  }
}

export function detect(projectDir) {
  const manifest = projectManifest(projectDir)
  const rows = []
  for (const { skill, packages, target } of PACKAGES) {
    const found = resolvePackage(projectDir, manifest, packages)
    if (!found) continue
    let status = 'ok'
    if (found.mismatch) status = 'range-mismatch'
    else if (found.major === undefined) status = 'unknown-version'
    else if (found.major < target) status = 'older-major'
    else if (found.major > target) status = 'newer-major'
    rows.push({ skill, package: found.name, range: found.range, installed: found.installed ?? null, target, status })
  }
  const shadcn = readJson(join(projectDir, 'components.json'))
  if (shadcn) {
    const primitive = ['@base-ui-components/react', '@base-ui/react'].some((n) => declaredRange(manifest, n))
      ? 'base-ui'
      : declaredRange(manifest, 'radix-ui') || Object.keys(manifest.dependencies ?? {}).some((n) => n.startsWith('@radix-ui/'))
        ? 'radix'
        : 'unknown'
    rows.push({ skill: 'shadcn', package: 'components.json', range: null, installed: primitive, target: null, status: 'ok' })
  }
  return rows
}

// Inside a git work tree, scan what git would track: honors .gitignore (vendored copies, builds).
// An empty list (the project sits in a parent repo's ignored tree) falls back to walking the disk.
function gitFiles(root) {
  try {
    const output = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const files = output
      .split('\0')
      .filter((file) => file && !file.split('/').some((part) => SKIPPED_DIRECTORIES.has(part)))
      .map((file) => ({ path: join(root, file), file }))
      .filter(({ path }) => existsSync(path))
    return files.length ? files : undefined
  } catch {
    return undefined
  }
}

function* projectFiles(dir, root) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name) && !entry.name.startsWith('.')) yield* projectFiles(path, root)
    } else if (entry.isFile()) {
      yield { path, file: relative(root, path).split(sep).join('/') }
    }
  }
}

// Gate each check on the project: its package is declared, the installed major is at least
// the check's `since`, and any `onlyIf` project file matches. `all` bypasses every gate.
function selectChecks(root, { skill, all }) {
  const manifest = all ? undefined : projectManifest(root)
  const rootFiles = readdirSync(root)
  let skipped = 0
  const checks = CHECKS.filter((check) => {
    if (skill && check.skill !== skill) return false
    if (all) return true
    const found = resolvePackage(root, manifest, check.packages)
    if (!found) return false
    if (check.since !== undefined && !(found.major >= check.since)) {
      skipped++
      return false
    }
    return (
      !check.onlyIf ||
      rootFiles.some(
        (file) => check.onlyIf.files.test(file) && check.onlyIf.pattern.test(readFileSync(join(root, file), 'utf8'))
      )
    )
  })
  return { checks, skipped }
}

export function scan(projectDir, { skill, all = false } = {}) {
  const root = resolve(projectDir)
  const { checks, skipped } = selectChecks(root, { skill, all })
  const hits = []
  let filesScanned = 0
  const files = checks.length ? (gitFiles(root) ?? projectFiles(root, root)) : []
  const seen = new Set()
  for (const { path, file } of files) {
    const applicable = checks.filter((check) => check.files.test(file))
    if (applicable.length === 0) continue
    const stats = statSync(path)
    if (!stats.isFile() || stats.size > MAX_FILE_BYTES) continue
    filesScanned++
    const text = readFileSync(path, 'utf8')
    for (const check of applicable) {
      if (check.requires && !check.requires.test(text)) continue
      // Match the whole file so multi-line imports and calls are caught; report the start line.
      const pattern = new RegExp(check.pattern.source, [...new Set(`${check.pattern.flags}gm`)].join(''))
      for (const match of text.matchAll(pattern)) {
        const lineStart = text.lastIndexOf('\n', match.index - 1) + 1
        if (COMMENT_LINE.test(text.slice(lineStart, match.index + 1))) continue
        const line = text.slice(0, match.index).split('\n').length
        const key = `${file}:${line}:${check.id}`
        if (seen.has(key)) continue
        seen.add(key)
        hits.push({
          file,
          line,
          skill: check.skill,
          rule: check.rule,
          message: check.message,
        })
      }
    }
  }
  return { checks: checks.length, skipped, filesScanned, hits }
}

function frontmatter(text) {
  if (!text.startsWith('---\n')) return undefined
  const end = text.indexOf('\n---\n', 4)
  return end === -1 ? undefined : text.slice(4, end)
}

export function lint(skillsDir = SKILLS_DIR) {
  const errors = []
  const ruleCounts = new Map()
  const resident = { tokens: 0, words: 0, listItems: 1 }
  const skillNames = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()

  for (const name of skillNames) {
    const dir = join(skillsDir, name)
    const at = (message) => errors.push(`${name}: ${message}`)
    if (!existsSync(join(dir, 'SKILL.md'))) {
      at('missing SKILL.md')
      continue
    }
    const text = readFileSync(join(dir, 'SKILL.md'), 'utf8')
    const meta = frontmatter(text)
    if (meta === undefined) {
      at('SKILL.md has no closed frontmatter')
      continue
    }
    if (!new RegExp(`^name: ${name}$`, 'm').test(meta)) at(`frontmatter name must be "${name}"`)
    const rawDescription = /^description: (.+)$/m.exec(meta)?.[1].trim()
    const description = rawDescription?.replace(/^(['"])(.*)\1$/, '$2')
    if (!description) at('description must be a single-line "description: ..." entry')
    else {
      if (rawDescription === description && /: | #/.test(description)) {
        at('description contains ": " or " #"; quote it or YAML parsers reject the frontmatter')
      }
      resident.tokens += Math.ceil(`${name} ${description}`.length / 4)
      resident.words += description.split(/\s+/).length
      resident.listItems += description.split(',').length - 1
    }

    const body = text.slice(meta.length + 9)
    for (const [, target] of body.matchAll(/\]\(((?!https?:|mailto:|#)[^)#\s]+)(?:#[^)]*)?\)/g)) {
      if (!existsSync(join(dir, target))) at(`broken link ${target}`)
    }
    const ruleDir = ['references', 'rules'].find((candidate) => existsSync(join(dir, candidate)))
    if (!ruleDir) continue
    const markdown = readdirSync(join(dir, ruleDir)).filter((file) => file.endsWith('.md'))
    const rules = markdown.filter((file) => !file.startsWith('_'))
    ruleCounts.set(name, rules.length)
    // Every shipped file must be reachable from SKILL.md; an orphan is dead weight in the bundle.
    for (const file of markdown) {
      const indexed = !file.startsWith('_') && body.includes(`\`${file.slice(0, -3)}\``)
      if (!indexed && !body.includes(`${ruleDir}/${file}`)) at(`${ruleDir}/${file} is not indexed in SKILL.md`)
    }
    for (const [, count] of body.matchAll(/\b(\d+) rules\b/g)) {
      if (Number(count) !== rules.length) at(`SKILL.md claims ${count} rules, found ${rules.length}`)
    }
  }

  if (resident.tokens > RESIDENT_TOKEN_BUDGET) {
    errors.push(`descriptions cost ${resident.tokens} resident tokens (budget ${RESIDENT_TOKEN_BUDGET})`)
  }
  if (resident.words > DESCRIPTION_WORD_BUDGET) {
    errors.push(`descriptions total ${resident.words} words (budget ${DESCRIPTION_WORD_BUDGET})`)
  }
  if (resident.listItems > DESCRIPTION_LIST_ITEM_BUDGET) {
    errors.push(`descriptions total ${resident.listItems} comma-separated items (budget ${DESCRIPTION_LIST_ITEM_BUDGET})`)
  }

  const readme = join(skillsDir, '..', 'README.md')
  if (existsSync(readme)) {
    for (const [, name, count] of readFileSync(readme, 'utf8').matchAll(/^\| \[([\w-]+)\]\(skills\/\1\) \| (\d+) \|/gm)) {
      if (ruleCounts.get(name) !== Number(count)) {
        errors.push(`README.md lists ${count} rules for ${name}, found ${ruleCounts.get(name) ?? 'no skill'}`)
      }
    }
  }

  // The scan table and package map describe this pack; skip them when linting another skills tree.
  const ownSkills = resolve(skillsDir) === SKILLS_DIR
  for (const check of ownSkills ? CHECKS : []) {
    if (/[gy]/.test(check.pattern.flags)) errors.push(`scan check ${check.id}: pattern must not be global or sticky`)
    const file = ['references', 'rules']
      .map((ruleDir) => join(skillsDir, check.skill, ruleDir, `${check.rule}.md`))
      .find((path) => existsSync(path))
    if (!file) errors.push(`scan check ${check.id}: ${check.skill}/${check.rule}.md does not exist`)
  }
  for (const { skill } of ownSkills ? PACKAGES : []) {
    if (!skillNames.includes(skill)) errors.push(`package map names unknown skill ${skill}`)
  }
  return { skills: skillNames.length, resident, errors }
}

function printTable(rows, columns) {
  const widths = columns.map((column) => Math.max(column.length, ...rows.map((row) => String(row[column] ?? '-').length)))
  const line = (values) => values.map((value, index) => String(value ?? '-').padEnd(widths[index])).join('  ').trimEnd()
  console.log(line(columns))
  for (const row of rows) console.log(line(columns.map((column) => row[column])))
}

function main(argv) {
  const options = parseArgs(argv)
  const [command, dir] = options.positional
  if (!command || options.help || command === 'help') {
    console.log(USAGE)
    return 0
  }
  const target = resolve(dir ?? '.')

  if (command === 'detect') {
    const rows = detect(target)
    if (options.json) console.log(JSON.stringify(rows, null, 2))
    else if (rows.length === 0) console.log('no packages covered by these skills found in package.json')
    else {
      printTable(rows, ['skill', 'package', 'installed', 'range', 'target', 'status'])
      if (rows.some((row) => row.status === 'older-major')) {
        console.log('\nolder-major: the skill targets a newer major; apply its migration rules only if upgrading.')
      }
      if (rows.some((row) => row.status === 'range-mismatch')) {
        console.log('range-mismatch: the resolved install is a different major than package.json declares; reinstall first.')
      }
    }
    return 0
  }

  if (command === 'scan') {
    if (options.skill && !CHECKS.some((check) => check.skill === options.skill)) {
      throw new UsageError(`no scan checks for skill "${options.skill}"`)
    }
    const result = scan(target, options)
    if (options.json) console.log(JSON.stringify(result, null, 2))
    else {
      for (const hit of result.hits.slice(0, MAX_REPORTED_HITS)) {
        console.log(`${hit.file}:${hit.line}  ${hit.skill}/${hit.rule}  ${hit.message}`)
      }
      if (result.hits.length > MAX_REPORTED_HITS) {
        console.log(`… ${result.hits.length - MAX_REPORTED_HITS} more; narrow with --skill or --json`)
      }
      console.log(
        `${result.hits.length} hit(s) · ${result.checks} check(s) · ${result.filesScanned} file(s)` +
          (result.hits.length ? ' · read references/<rule>.md in the named skill before editing' : '')
      )
      if (result.skipped) {
        console.log(`${result.skipped} check(s) skipped: installed major predates them (see detect; --all runs them)`)
      }
    }
    return result.hits.length ? 1 : 0
  }

  if (command === 'lint') {
    const result = lint(dir ? target : SKILLS_DIR)
    if (options.json) console.log(JSON.stringify(result, null, 2))
    else {
      for (const error of result.errors) console.log(error)
      const { tokens, words, listItems } = result.resident
      console.log(
        `${result.errors.length} error(s) across ${result.skills} skill(s) · ` +
          `descriptions: ${tokens}t resident, ${words} words, ${listItems} list items`
      )
    }
    return result.errors.length ? 1 : 0
  }

  throw new UsageError(`unknown command: ${command}`)
}

// npx runs this through a node_modules/.bin symlink, so compare real paths.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof UsageError ? `${error.message}\n\n${USAGE}` : error.message)
    process.exitCode = error instanceof UsageError ? 2 : 1
  }
}
