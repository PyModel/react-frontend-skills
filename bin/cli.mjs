import { resolve } from 'node:path'
import { detect } from './detect.mjs'
import { UsageError } from './errors.mjs'
import { lint, SKILLS_DIR } from './lint.mjs'

export const USAGE = `usage: react-frontend-skills <command> [options]

commands:
  detect [dir]        installed library versions vs. the version each skill targets
  lint [skills-dir]   maintainers: validate skill frontmatter, indexes, links and counts

options:
  --json   machine-readable output

exit codes: 0 clean · 1 lint errors · 2 usage error`

function parseArgs(argv) {
  const options = { json: false, positional: [] }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--json') options.json = true
    else if (arg === '-h' || arg === '--help') options.help = true
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
  const target = resolve(dir ?? '.')

  if (command === 'detect') {
    const rows = detect(target)
    if (options.json) console.log(JSON.stringify(rows, null, 2))
    else if (rows.length === 0) console.log('no packages covered by these skills found in package.json')
    else {
      printTable(rows, ['skill', 'package', 'installed', 'range', 'target', 'status'])
      if (rows.some((row) => row.status === 'older-major')) {
        console.log('\nolder-major: the skill targets a newer major. These skills cover only the target major; upgrade before applying them.')
      }
      if (rows.some((row) => row.status === 'range-mismatch')) {
        console.log('range-mismatch: the resolved install is a different major than package.json declares; reinstall first.')
      }
    }
    return 0
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
