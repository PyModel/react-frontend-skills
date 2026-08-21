import assert from 'node:assert/strict'
import { once } from 'node:events'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js'
import { createSkillsServer } from '../src/server.js'

const testDirectory = dirname(fileURLToPath(import.meta.url))
const repositorySkills = resolve(testDirectory, '..', '..', 'skills')
const binaryPath = resolve(testDirectory, '..', 'bin', 'react-frontend-skills-mcp.js')

async function connectInMemory(context) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'react-skills-test-client', version: '1.0.0' })
  const { server, catalog } = await createSkillsServer({ skillsDir: repositorySkills })

  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)])
  context.after(async () => {
    await Promise.allSettled([client.close(), server.close()])
  })

  return { client, catalog }
}

test('advertises the complete read-only tool surface', async (context) => {
  const { client } = await connectInMemory(context)
  const response = await client.listTools()

  assert.deepEqual(
    response.tools.map((tool) => tool.name).sort(),
    ['get_reference', 'get_skill', 'list_skills', 'search_skills']
  )
  assert.ok(response.tools.every((tool) => tool.annotations?.readOnlyHint === true))
  assert.ok(response.tools.every((tool) => tool.annotations?.destructiveHint === false))
})

test('serves skill discovery, search, and complete content through tools', async (context) => {
  const { client } = await connectInMemory(context)

  const listResult = await client.callTool({ name: 'list_skills', arguments: {} })
  const listedSkills = JSON.parse(listResult.content[0].text)
  assert.equal(listedSkills.length, 18)
  assert.ok(listedSkills.some((skill) => skill.name === 'react'))

  const searchResult = await client.callTool({
    name: 'search_skills',
    arguments: { query: 'cache components', skill: 'nextjs', limit: 2 },
  })
  const searchPayload = JSON.parse(searchResult.content[0].text)
  assert.ok(searchPayload.matches.length > 0)
  assert.ok(searchPayload.matches.length <= 2)
  assert.ok(searchPayload.matches.every((match) => match.skill === 'nextjs'))

  const skillResult = await client.callTool({
    name: 'get_skill',
    arguments: { name: 'react' },
  })
  assert.match(skillResult.content[0].text, /# React 19 Best Practices/)

  const referenceResult = await client.callTool({
    name: 'get_reference',
    arguments: { skill: 'nextjs', path: 'references/cache-fetch-options.md' },
  })
  assert.match(referenceResult.content[0].text, /Configure Fetch Cache Options Explicitly/)
})

test('returns explicit tool errors for unknown skills and unsafe references', async (context) => {
  const { client } = await connectInMemory(context)

  const unknownSkill = await client.callTool({
    name: 'get_skill',
    arguments: { name: 'does-not-exist' },
  })
  assert.equal(unknownSkill.isError, true)
  assert.match(unknownSkill.content[0].text, /Unknown skill/)

  const unknownFilter = await client.callTool({
    name: 'search_skills',
    arguments: { query: 'cache', skill: 'does-not-exist' },
  })
  assert.equal(unknownFilter.isError, true)
  assert.match(unknownFilter.content[0].text, /Unknown skill/)

  const unsafeReference = await client.callTool({
    name: 'get_reference',
    arguments: { skill: 'nextjs', path: '../package.json' },
  })
  assert.equal(unsafeReference.isError, true)
  assert.match(unsafeReference.content[0].text, /Unknown reference/)
})

test('rejects invalid tool schemas and unknown resource IDs', async (context) => {
  const { client } = await connectInMemory(context)
  const invalidCalls = [
    { query: '' },
    { query: 'x'.repeat(201) },
    { query: 'cache', limit: 21 },
  ]

  for (const arguments_ of invalidCalls) {
    const result = await client.callTool({
      name: 'search_skills',
      arguments: arguments_,
    })
    assert.equal(result.isError, true)
    assert.match(result.content[0].text, /validation|invalid/i)
  }

  await assert.rejects(
    client.readResource({ uri: 'react-skills://file/dW5rbm93bi9TS0lMTC5tZA' }),
    (error) => error?.code === ErrorCode.InvalidParams
  )
})

test('lists and reads every Markdown file as an MCP resource', async (context) => {
  const { client, catalog } = await connectInMemory(context)
  const response = await client.listResources()

  assert.equal(response.resources.length, catalog.files.length + 1)
  const skillResource = response.resources.find(
    (resource) => resource.name === 'nextjs/references/cache-fetch-options.md'
  )
  assert.ok(skillResource)

  const readResult = await client.readResource({ uri: skillResource.uri })
  assert.equal(readResult.contents[0].mimeType, 'text/markdown')
  assert.match(readResult.contents[0].text, /Configure Fetch Cache Options Explicitly/)

  const catalogResult = await client.readResource({ uri: 'react-skills://catalog' })
  assert.equal(JSON.parse(catalogResult.contents[0].text).length, 18)
})

test(
  'stdio binary starts and answers MCP requests without extra stdout output',
  { timeout: 15_000 },
  async (context) => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [binaryPath],
      env: {
        ...process.env,
        REACT_FRONTEND_SKILLS_DIR: repositorySkills,
      },
    })
    const client = new Client({ name: 'react-skills-stdio-test', version: '1.0.0' })

    context.after(() => client.close())
    await client.connect(transport)

    const response = await client.listTools()
    assert.equal(response.tools.length, 4)
  }
)

test(
  'stdio binary exits cleanly on SIGTERM',
  { timeout: 15_000, skip: process.platform === 'win32' },
  async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [binaryPath],
      env: {
        ...process.env,
        REACT_FRONTEND_SKILLS_DIR: repositorySkills,
      },
    })
    const client = new Client({ name: 'react-skills-signal-test', version: '1.0.0' })

    try {
      await client.connect(transport)
      await client.listTools()

      const child = transport._process
      assert.ok(child)
      assert.equal(child.kill('SIGTERM'), true)

      const [code, signal] = await once(child, 'exit', {
        signal: AbortSignal.timeout(5_000),
      })
      assert.equal(code, 0)
      assert.equal(signal, null)
    } finally {
      await client.close().catch(() => undefined)
    }
  }
)
