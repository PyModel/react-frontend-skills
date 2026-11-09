import { execFile } from 'node:child_process'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { dotfilesIn, parsePackOutput } from '../../scripts/npm-pack.mjs'
import { loadCatalog } from '../src/catalog.js'

const execute = promisify(execFile)
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const generatedData = resolve(packageRoot, 'data')
// Run npm's own CLI through node: Windows refuses to spawn npm.cmd without a shell.
// `npm run` sets npm_execpath; run this script through `npm run test:package`.
async function npm(args, options) {
  if (!process.env.npm_execpath) throw new Error('Run through npm: npm run test:package')
  return execute(process.execPath, [process.env.npm_execpath, ...args], { maxBuffer: 10 * 1024 * 1024, ...options })
}

async function pathExists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  const source = await loadCatalog({ skillsDir: resolve(packageRoot, '..', 'skills') })
  const installationRoot = await mkdtemp(joinTempPath())
  let client

  try {
    // Pack into the temp dir, so a tarball already sitting in the package root is never touched.
    const { stdout } = await npm(['pack', '--json', '--silent', '--pack-destination', installationRoot], { cwd: packageRoot })
    const packed = parsePackOutput(stdout)
    const tarballPath = resolve(installationRoot, packed.filename)
    const dotfiles = dotfilesIn(packed.files)
    if (dotfiles.length) throw new Error(`Tarball ships dotfiles: ${dotfiles.join(', ')}`)

    if (await pathExists(generatedData)) {
      throw new Error('postpack did not remove generated data')
    }

    await writeFile(
      resolve(installationRoot, 'package.json'),
      JSON.stringify({ name: 'react-skills-mcp-smoke', private: true, type: 'module' })
    )
    await npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', tarballPath], { cwd: installationRoot })

    // Run the installed bin through node: Windows refuses to spawn .cmd shims without a shell.
    const entry = resolve(
      installationRoot,
      'node_modules',
      '@pymodel',
      'react-frontend-skills-mcp',
      'bin',
      'react-frontend-skills-mcp.js'
    )
    const transport = new StdioClientTransport({ command: process.execPath, args: [entry] })
    client = new Client({ name: 'packaged-smoke-test', version: '1.0.0' })
    await client.connect(transport)

    const tools = await client.listTools()
    if (tools.tools.length !== 4) {
      throw new Error(`Expected 4 tools, received ${tools.tools.length}`)
    }

    const skillsResult = await client.callTool({ name: 'list_skills', arguments: {} })
    const skills = JSON.parse(skillsResult.content[0].text)
    if (skills.length !== source.skills.length) {
      throw new Error(`Expected ${source.skills.length} skills, received ${skills.length}`)
    }

    // One resource per Markdown file plus the JSON catalog resource.
    const resources = await client.listResources()
    if (resources.resources.length !== source.files.length + 1) {
      throw new Error(
        `Expected ${source.files.length + 1} resources, received ${resources.resources.length}`
      )
    }

    process.stdout.write('installed tarball MCP smoke: PASS\n')
  } finally {
    await client?.close().catch(() => undefined)
    await rm(installationRoot, { recursive: true, force: true })
    await rm(generatedData, { recursive: true, force: true })
  }
}

function joinTempPath() {
  return resolve(tmpdir(), `react-skills-mcp-smoke-${process.pid}-`)
}

await main()
