import { readFileSync } from 'node:fs'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { loadCatalog } from './catalog.js'

const packageMetadata = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
)

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}

function textResult(text) {
  return { content: [{ type: 'text', text }] }
}

function jsonResult(value) {
  return textResult(JSON.stringify(value, null, 2))
}

function errorResult(message) {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  }
}

function registerTools(server, catalog) {
  server.registerTool(
    'list_skills',
    {
      title: 'List React Frontend Skills',
      description: 'List all available skills with descriptions, file counts, and resource URIs.',
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async () => jsonResult(catalog.listSkills())
  )

  server.registerTool(
    'search_skills',
    {
      title: 'Search React Frontend Skills',
      description:
        'Search skill documentation and return bounded, ranked excerpts with source paths and line numbers.',
      inputSchema: {
        query: z.string().trim().min(1).max(200).describe('Terms to search for'),
        skill: z
          .string()
          .trim()
          .min(1)
          .max(100)
          .optional()
          .describe('Optional exact skill name to search within'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe('Maximum number of matches'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ query, skill, limit }) => {
      if (skill && !catalog.getSkill(skill)) {
        return errorResult(`Unknown skill: ${skill}`)
      }

      return jsonResult({
        query,
        skill: skill ?? null,
        matches: catalog.search(query, { skill, limit }),
      })
    }
  )

  server.registerTool(
    'get_skill',
    {
      title: 'Get Complete Skill',
      description: 'Return the complete SKILL.md for one exact skill name.',
      inputSchema: {
        name: z.string().trim().min(1).max(100).describe('Exact skill name'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ name }) => {
      const skill = catalog.getSkill(name)
      if (!skill) return errorResult(`Unknown skill: ${name}`)
      return textResult(skill.content)
    }
  )

  server.registerTool(
    'get_reference',
    {
      title: 'Get Skill Reference',
      description:
        'Return one Markdown file from a skill using its relative path, such as references/cache-fetch-options.md.',
      inputSchema: {
        skill: z.string().trim().min(1).max(100).describe('Exact skill name'),
        path: z
          .string()
          .trim()
          .min(1)
          .max(300)
          .describe('Relative Markdown path inside the skill'),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ skill, path }) => {
      if (!catalog.getSkill(skill)) return errorResult(`Unknown skill: ${skill}`)

      const reference = catalog.getReference(skill, path)
      if (!reference) return errorResult(`Unknown reference: ${skill}/${path}`)
      return textResult(reference.content)
    }
  )
}

function registerResources(server, catalog) {
  server.registerResource(
    'skill-catalog',
    'react-skills://catalog',
    {
      title: 'React Frontend Skills Catalog',
      description: 'JSON catalog of every available React frontend skill.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(catalog.listSkills(), null, 2),
        },
      ],
    })
  )

  const fileTemplate = new ResourceTemplate('react-skills://file/{id}', {
    list: async () => ({ resources: catalog.listResources() }),
  })

  server.registerResource(
    'skill-file',
    fileTemplate,
    {
      title: 'React Frontend Skill File',
      description: 'A complete Markdown file from the React frontend skills catalog.',
      mimeType: 'text/markdown',
    },
    async (uri, variables) => {
      const id = Array.isArray(variables.id) ? variables.id[0] : variables.id
      const file = catalog.getFileById(String(id))
      if (!file) {
        throw new McpError(ErrorCode.InvalidParams, `Unknown skill resource: ${uri.href}`)
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: file.content,
          },
        ],
      }
    }
  )
}

export async function createSkillsServer(options = {}) {
  const catalog = options.catalog ?? (await loadCatalog({ skillsDir: options.skillsDir }))
  const server = new McpServer({
    name: packageMetadata.name,
    version: packageMetadata.version,
  })

  registerTools(server, catalog)
  registerResources(server, catalog)

  return { server, catalog }
}

export async function startStdioServer(options = {}) {
  const { server, catalog } = await createSkillsServer(options)
  const transport = new StdioServerTransport()
  await server.connect(transport)
  return { server, catalog, transport }
}
