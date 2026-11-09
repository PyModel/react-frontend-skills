import { readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { PACKAGES } from './checks.mjs'
import { UsageError } from './errors.mjs'

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return undefined
    throw new Error(`cannot parse ${path}: ${error.message}`)
  }
}

export function projectManifest(projectDir) {
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
      // A malformed installed copy must not abort detection; keep resolving upward.
    }
    if (version) return version
    if (dirname(dir) === dir) return undefined
  }
}

// Without node_modules (pnpm or PnP before install, CI caches), npm's lockfile still records
// the resolved version. ponytail: pnpm-lock.yaml and yarn.lock are not read; add a parser
// when a user reports `unknown-version` on one of them.
function lockedVersion(projectDir, name) {
  const project = resolve(projectDir)
  for (let dir = project; ; dir = dirname(dir)) {
    let lock
    try {
      lock = readJson(join(dir, 'package-lock.json'))
    } catch {
      // Same rule as installedVersion: a malformed ancestor file must not abort detection.
    }
    const nested = relative(dir, project).split(sep).join('/')
    // An ancestor lockfile speaks for the project only when it lists it as a workspace.
    const covers = nested === '' || lock?.packages?.[nested] !== undefined
    const version = covers
      ? (lock?.packages?.[`${nested ? `${nested}/` : ''}node_modules/${name}`]?.version ??
        lock?.packages?.[`node_modules/${name}`]?.version ??
        // lockfileVersion 1 (npm 6) has no `packages`, only a root `dependencies` tree.
        (nested === '' ? lock?.dependencies?.[name]?.version : undefined))
      : undefined
    if (version) return version
    if (dirname(dir) === dir) return undefined
  }
}

function installedMajor(version) {
  const match = /^v?(\d+)\./.exec(version ?? '')
  return match ? Number(match[1]) : undefined
}

// Only a range that pins one major ("19", "^19.1", "~19.1.0", "19.x", "=19.0.0") says which
// major is meant. Open ranges (">=18", "^18 || ^19", "*"), tags, workspace:, catalog: and
// versionless aliases do not, so they defer to the installed version.
export function rangeMajor(range) {
  let spec = range?.trim()
  if (spec?.startsWith('npm:')) {
    // "npm:typescript@^7.0.2" carries the range after the last "@"; index 4 is a scope marker.
    const at = spec.lastIndexOf('@')
    if (at <= 4) return undefined
    spec = spec.slice(at + 1)
  }
  const match = /^(?:[\^~]|=)?v?(\d+)(?:\.(?:\d+|[xX*])){0,2}(?:-[\w.-]+)?$/.exec(spec ?? '')
  return match ? Number(match[1]) : undefined
}

// The first declared package wins. An ancestor node_modules can hoist a different major than
// package.json declares, so gate on the lower of the two: a check never fires on a guess.
export function resolvePackage(projectDir, manifest, packages) {
  const name = packages.find((candidate) => declaredRange(manifest, candidate))
  if (!name) return undefined
  const range = declaredRange(manifest, name)
  const installed = installedVersion(projectDir, name) ?? lockedVersion(projectDir, name)
  const majors = [installedMajor(installed), rangeMajor(range)].filter((value) => value !== undefined)
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
