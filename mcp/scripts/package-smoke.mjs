import { execFile } from 'node:child_process'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const execute = promisify(execFile)
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const generatedData = resolve(packageRoot, 'data')
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

async function pathExists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  const installationRoot = await mkdtemp(joinTempPath())
  let tarballPath
  let client

  try {
    const { stdout } = await execute(npmCommand, ['pack', '--json', '--silent'], {
      cwd: packageRoot,
      maxBuffer: 10 * 1024 * 1024,
    })
    const packResult = JSON.parse(stdout)
    tarballPath = resolve(packageRoot, packResult[0].filename)

    if (await pathExists(generatedData)) {
      throw new Error('postpack did not remove generated data')
    }

    await writeFile(
      resolve(installationRoot, 'package.json'),
      JSON.stringify({ name: 'react-skills-mcp-smoke', private: true, type: 'module' })
    )
    await execute(
      npmCommand,
      ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarballPath],
      { cwd: installationRoot, maxBuffer: 10 * 1024 * 1024 }
    )

    const executable = resolve(
      installationRoot,
      'node_modules',
      '.bin',
      process.platform === 'win32'
        ? 'react-frontend-skills-mcp.cmd'
        : 'react-frontend-skills-mcp'
    )
    const transport = new StdioClientTransport({ command: executable })
    client = new Client({ name: 'packaged-smoke-test', version: '1.0.0' })
    await client.connect(transport)

    const tools = await client.listTools()
    if (tools.tools.length !== 4) {
      throw new Error(`Expected 4 tools, received ${tools.tools.length}`)
    }

    const skillsResult = await client.callTool({ name: 'list_skills', arguments: {} })
    const skills = JSON.parse(skillsResult.content[0].text)
    if (skills.length !== 18) {
      throw new Error(`Expected 18 skills, received ${skills.length}`)
    }

    const resources = await client.listResources()
    if (resources.resources.length !== 739) {
      throw new Error(`Expected 739 resources, received ${resources.resources.length}`)
    }

    process.stdout.write('installed tarball MCP smoke: PASS\n')
  } finally {
    await client?.close().catch(() => undefined)
    if (tarballPath) await rm(tarballPath, { force: true })
    await rm(installationRoot, { recursive: true, force: true })
    await rm(generatedData, { recursive: true, force: true })
  }
}

function joinTempPath() {
  return resolve(tmpdir(), `react-skills-mcp-smoke-${process.pid}-`)
}

await main()
