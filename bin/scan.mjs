import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { CHECKS, checkMatchesSkill } from './checks.mjs'
import { projectManifest, resolvePackage } from './detect.mjs'
import { maskComments } from './mask-comments.mjs'

const SKIPPED_DIRECTORIES = new Set([
  'node_modules', '.git', '.next', '.turbo', '.vercel', '.output', 'dist', 'build', 'out',
  'coverage', 'storybook-static', 'playwright-report', 'test-results',
])
const MAX_FILE_BYTES = 512 * 1024

// Inside a git work tree, scan what git would track: honors .gitignore (vendored copies, builds).
// An empty list (the project sits in a parent repo's ignored tree) falls back to walking the disk.
function gitFiles(root) {
  try {
    // The project is untrusted: never let its git config run an fsmonitor hook.
    const output = execFileSync('git', ['-c', 'core.fsmonitor=false', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const files = output
      .split('\0')
      // Dot-directories are skipped like the disk walk does; dotfiles (.postcssrc.json) stay.
      .filter((file) => file && !file.split('/').slice(0, -1).some((part) => SKIPPED_DIRECTORIES.has(part) || part.startsWith('.')))
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

function projectFileMatches({ files, pattern }, root, rootFiles) {
  return rootFiles.some((file) => {
    if (!files.test(file)) return false
    const path = join(root, file)
    let stats
    try {
      stats = statSync(path)
    } catch {
      return false // dangling symlink or a file removed mid-scan
    }
    return stats.isFile() && stats.size <= MAX_FILE_BYTES && pattern.test(maskComments(readFileSync(path, 'utf8'), file))
  })
}

// Gate each check on the project: its package is declared, the installed major is at least
// the check's `since`, and any `onlyIf` project file matches. `all` bypasses the package and
// version gates, not `onlyIf`: a config flag decides whether the API is an error at all.
function selectChecks(root, { skill, all }) {
  const manifest = all ? undefined : projectManifest(root)
  // `onlyIf` reads root-level project files; scan the app directory in a monorepo.
  const rootFiles = readdirSync(root)
  let skipped = 0
  let unknown = 0
  const checks = CHECKS.filter((check) => {
    if (skill && !checkMatchesSkill(check, skill)) return false
    // A check the project config rules out is neither skipped nor unknown: it never applies.
    const ruledOut = () => check.onlyIf && !projectFileMatches(check.onlyIf, root, rootFiles)
    if (all) return !ruledOut()
    const found = resolvePackage(root, manifest, check.packages)
    if (!found || ruledOut()) return false
    if (check.since !== undefined && found.major === undefined) {
      unknown++
      return false
    }
    if (check.since !== undefined && found.major < check.since) {
      skipped++
      return false
    }
    return true
  })
  return { checks, skipped, unknown }
}

// Compile every check once per scan. `matchAll` clones the regex, so sharing it across files
// cannot leak `lastIndex` between them.
function checkPattern(check) {
  return new RegExp(check.pattern.source, [...new Set(`${check.pattern.flags}gm`)].join(''))
}

export function scan(projectDir, { skill, all = false } = {}) {
  const root = resolve(projectDir)
  const { checks, skipped, unknown } = selectChecks(root, { skill, all })
  const patterns = new Map(checks.map((check) => [check, checkPattern(check)]))
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
    const code = maskComments(text, file)
    for (const check of applicable) {
      if (check.requires && !check.requires.test(code)) continue
      // Match the whole file so multi-line imports and calls are caught; report the line of the
      // first non-blank character, since a leading \s* in a pattern can start on earlier lines.
      const pattern = patterns.get(check)
      // Matches arrive in order, so count newlines incrementally instead of re-splitting the file.
      let line = 1
      let counted = 0
      for (const match of code.matchAll(pattern)) {
        const start = match.index + Math.max(0, match[0].search(/\S/))
        for (let at = code.indexOf('\n', counted); at !== -1 && at < start; at = code.indexOf('\n', at + 1)) line++
        counted = start
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
  return { checks: checks.length, skipped, unknown, filesScanned, hits }
}
