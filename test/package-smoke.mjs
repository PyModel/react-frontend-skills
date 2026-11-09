// Packs the root package, installs the tarball into a temp project, and runs the CLI through
// the installed node_modules/.bin entry, the path npx uses. Needs no registry: the package has
// no dependencies and the temp project declares none until after the install.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dotfilesIn, parsePackOutput } from '../scripts/npm-pack.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
// Run npm's own CLI through node: Windows refuses to spawn npm.cmd without a shell.
if (!process.env.npm_execpath) throw new Error('Run through npm: npm run test:package')
const npm = (args, cwd) => run(process.execPath, [process.env.npm_execpath, ...args], cwd)

const project = mkdtempSync(join(tmpdir(), 'rfs-package-smoke-'))
try {
  const packed = parsePackOutput(npm(['pack', '--json', '--silent', '--pack-destination', project], root))
  const dotfiles = dotfilesIn(packed.files)
  if (dotfiles.length) throw new Error(`tarball ships dotfiles: ${dotfiles.join(', ')}`)

  writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'rfs-smoke', private: true }))
  npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', join(project, packed.filename)], project)
  writeFileSync(
    join(project, 'package.json'),
    JSON.stringify({ name: 'rfs-smoke', private: true, dependencies: { react: '^19.0.0' } })
  )

  // POSIX: the .bin symlink (exercises the realpath check in main). Windows: .bin holds a .cmd
  // shim that needs a shell, so run the installed entry through node instead.
  const installed = join(project, 'node_modules', '@pymodel', 'react-frontend-skills', 'bin', 'react-frontend-skills.mjs')
  const cli = (args) =>
    process.platform === 'win32'
      ? run(process.execPath, [installed, ...args], project)
      : run(join(project, 'node_modules', '.bin', 'react-frontend-skills'), args, project)
  const lint = JSON.parse(cli(['lint', '--json']))
  if (lint.errors.length) throw new Error(`packaged lint failed:\n${lint.errors.join('\n')}`)
  const skillCount = readdirSync(join(root, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.')).length
  if (lint.skills !== skillCount) {
    throw new Error(`packaged lint saw ${lint.skills} skills, repository has ${skillCount}`)
  }
  const detect = JSON.parse(cli(['detect', '--json']))
  if (!detect.some((row) => row.skill === 'react')) throw new Error(`detect missed react: ${JSON.stringify(detect)}`)

  process.stdout.write(`installed tarball CLI smoke: PASS (${packed.files.length} files)\n`)
} finally {
  rmSync(project, { recursive: true, force: true })
}
