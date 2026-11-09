import { resolve } from 'node:path'
import { CHECKS, checkMatchesSkill } from './checks.mjs'
import { detect } from './detect.mjs'
import { UsageError } from './errors.mjs'
import { lint, SKILLS_DIR } from './lint.mjs'
import { scan } from './scan.mjs'

const MAX_REPORTED_HITS = 200

export const USAGE = `usage: react-frontend-skills <command> [options]

commands:
  detect [dir]                 installed library versions vs. the version each skill targets
  scan [dir] [--skill <name>]  flag deprecated or removed APIs; each hit names the rule to read
  lint [skills-dir]            maintainers: validate skill frontmatter, indexes, and scan rules

options:
  --json   machine-readable output
  --all    scan: run checks even for packages not in package.json or below the target major

exit codes: 0 clean · 1 scan hits or lint errors · 2 usage error`

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

function printTable(rows, columns) {
  const widths = columns.map((column) => Math.max(column.length, ...rows.map((row) => String(row[column] ?? '-').length)))
  const line = (values) => values.map((value, index) => String(value ?? '-').padEnd(widths[index])).join('  ').trimEnd()
  console.log(line(columns))
  for (const row of rows) console.log(line(columns.map((column) => row[column])))
}

export function main(argv) {
  const options = parseArgs(argv)
  const [command, dir, ...extra] = options.positional
  if (!command || options.help || command === 'help') {
    console.log(USAGE)
    return 0
  }
  if (extra.length) throw new UsageError(`unexpected argument: ${extra[0]}`)
  if (command !== 'scan') {
    const flag = options.all ? '--all' : options.skill !== undefined ? '--skill' : undefined
    if (flag) throw new UsageError(`${flag} is only valid for scan`)
  }
  const target = resolve(dir ?? '.')

  if (command === 'detect') {
    const rows = detect(target)
    if (options.json) console.log(JSON.stringify(rows, null, 2))
    else if (rows.length === 0) console.log('no packages covered by these skills found in package.json')
    else {
      printTable(rows, ['skill', 'package', 'installed', 'range', 'target', 'status'])
      if (rows.some((row) => row.status === 'older-major')) {
        console.log('\nolder-major: the skill targets a newer major. Write code for the installed major (follow the skill\'s notes for that version) and apply migration rules only if upgrading.')
      }
      if (rows.some((row) => row.status === 'range-mismatch')) {
        console.log('range-mismatch: the resolved install is a different major than package.json declares; reinstall first.')
      }
    }
    return 0
  }

  if (command === 'scan') {
    if (options.skill && !CHECKS.some((check) => checkMatchesSkill(check, options.skill))) {
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
          (result.hits.length ? ' · read the named skill\'s references/<rule>.md (or rules/<rule>.md) before editing' : '')
      )
      if (result.skipped) {
        console.log(`${result.skipped} check(s) skipped: installed major predates them (see detect; --all runs them)`)
      }
      if (result.unknown) {
        console.log(
          `${result.unknown} check(s) skipped: version unknown (tag, workspace or catalog range and no install; ` +
            'install dependencies, or --all runs them)'
        )
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
