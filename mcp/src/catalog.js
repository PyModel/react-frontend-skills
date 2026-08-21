import { readdir, readFile, realpath, stat } from 'node:fs/promises'
import { isAbsolute, posix, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const MAX_SEARCH_LIMIT = 20
const DEFAULT_SEARCH_LIMIT = 10
const MAX_SNIPPET_LENGTH = 480

function parseFrontmatter(content, filePath) {
  if (!content.startsWith('---\n')) return {}

  const closingIndex = content.indexOf('\n---\n', 4)
  if (closingIndex === -1) {
    throw new Error(`Unclosed frontmatter in ${filePath}`)
  }

  try {
    const parsed = parseYaml(content.slice(4, closingIndex))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${filePath}: ${error.message}`, {
      cause: error,
    })
  }
}

function markdownTitle(content, metadata, fallback) {
  if (typeof metadata.title === 'string' && metadata.title.trim()) {
    return metadata.title.trim()
  }

  const heading = content
    .split('\n')
    .find((line) => /^#{1,3}\s+\S/.test(line))

  return heading ? heading.replace(/^#{1,3}\s+/, '').trim() : fallback
}

async function collectMarkdownFiles(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue

    const absolutePath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(absolutePath, root)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({
        absolutePath,
        relativePath: relative(root, absolutePath).split(sep).join('/'),
      })
    }
  }

  return files
}

async function directoryExists(directory) {
  try {
    return (await stat(directory)).isDirectory()
  } catch {
    return false
  }
}

async function resolveSkillsDirectory(explicitDirectory) {
  const configuredDirectory = explicitDirectory ?? process.env.REACT_FRONTEND_SKILLS_DIR
  if (configuredDirectory) {
    const configuredPath = resolve(configuredDirectory)
    if (!(await directoryExists(configuredPath))) {
      throw new Error(`Configured skills directory does not exist: ${configuredPath}`)
    }
    return realpath(configuredPath)
  }

  const candidates = [
    fileURLToPath(new URL('../data/skills', import.meta.url)),
    fileURLToPath(new URL('../../skills', import.meta.url)),
  ]

  for (const candidate of candidates) {
    if (await directoryExists(candidate)) return realpath(candidate)
  }

  throw new Error(
    'Unable to locate packaged skills. Reinstall the package or set REACT_FRONTEND_SKILLS_DIR.'
  )
}

function fileId(skillName, relativePath) {
  return Buffer.from(`${skillName}/${relativePath}`, 'utf8').toString('base64url')
}

function fileUri(id) {
  return `react-skills://file/${id}`
}

function normalizeQuery(value) {
  return value.normalize('NFKC').trim().toLowerCase()
}

function boundedSnippet(lines, lineIndex) {
  const start = Math.max(0, lineIndex - 1)
  const end = Math.min(lines.length, lineIndex + 2)
  const snippet = lines.slice(start, end).join('\n').trim()

  if (snippet.length <= MAX_SNIPPET_LENGTH) return snippet
  return `${snippet.slice(0, MAX_SNIPPET_LENGTH - 1)}…`
}

function matchingLine(lines, normalizedQuery, tokens) {
  const exactIndex = lines.findIndex((line) => line.toLowerCase().includes(normalizedQuery))
  if (exactIndex !== -1) return exactIndex

  const tokenIndex = lines.findIndex((line) => {
    const normalizedLine = line.toLowerCase()
    return tokens.some((token) => normalizedLine.includes(token))
  })

  return tokenIndex === -1 ? 0 : tokenIndex
}

function searchScore(file, normalizedQuery, tokens) {
  const normalizedPath = `${file.skillName}/${file.relativePath}`.toLowerCase()
  const normalizedTitle = file.title.toLowerCase()
  const normalizedDescription = file.description.toLowerCase()
  const searchable = `${normalizedPath}\n${normalizedTitle}\n${normalizedDescription}\n${file.normalizedContent}`

  if (!tokens.every((token) => searchable.includes(token))) return 0

  let score = 1
  if (file.skillName.toLowerCase() === normalizedQuery) score += 300
  if (normalizedPath === normalizedQuery) score += 250
  if (normalizedPath.includes(normalizedQuery)) score += 100
  if (normalizedTitle.includes(normalizedQuery)) score += 80
  if (normalizedDescription.includes(normalizedQuery)) score += 50
  if (file.normalizedContent.includes(normalizedQuery)) score += 30

  for (const token of tokens) {
    if (normalizedPath.includes(token)) score += 12
    if (normalizedTitle.includes(token)) score += 10
    if (normalizedDescription.includes(token)) score += 6
    if (file.normalizedContent.includes(token)) score += 3
  }

  return score
}

function normalizeReferencePath(referencePath) {
  if (
    !referencePath ||
    isAbsolute(referencePath) ||
    referencePath.includes('\\') ||
    referencePath.includes('\0')
  ) {
    return null
  }

  const normalized = posix.normalize(referencePath)
  if (normalized === '..' || normalized.startsWith('../') || !normalized.endsWith('.md')) {
    return null
  }

  return normalized
}

export class SkillsCatalog {
  constructor(skillsDirectory, skills, files) {
    this.skillsDirectory = skillsDirectory
    this.skills = skills
    this.files = files
    this.skillsByName = new Map(skills.map((skill) => [skill.name, skill]))
    this.filesById = new Map(files.map((file) => [file.id, file]))
    this.filesByPath = new Map(
      files.map((file) => [`${file.skillName}/${file.relativePath}`, file])
    )
  }

  listSkills() {
    return this.skills.map(({ name, description, fileCount }) => ({
      name,
      description,
      fileCount,
      uri: fileUri(fileId(name, 'SKILL.md')),
    }))
  }

  listResources() {
    return this.files.map((file) => ({
      uri: file.uri,
      name: `${file.skillName}/${file.relativePath}`,
      title: file.title,
      description: file.description || `Documentation from the ${file.skillName} skill`,
      mimeType: 'text/markdown',
    }))
  }

  getSkill(name) {
    return this.skillsByName.get(name)
  }

  getReference(skillName, referencePath) {
    const normalizedPath = normalizeReferencePath(referencePath)
    if (!normalizedPath) return undefined
    return this.filesByPath.get(`${skillName}/${normalizedPath}`)
  }

  getFileById(id) {
    return this.filesById.get(id)
  }

  search(query, { skill, limit = DEFAULT_SEARCH_LIMIT } = {}) {
    const normalizedQuery = normalizeQuery(query)
    if (!normalizedQuery) return []

    const tokens = [...new Set(normalizedQuery.split(/\s+/).filter(Boolean))]
    const boundedLimit = Math.min(Math.max(1, limit), MAX_SEARCH_LIMIT)
    const sourceFiles = skill
      ? this.files.filter((file) => file.skillName === skill)
      : this.files

    return sourceFiles
      .map((file) => ({ file, score: searchScore(file, normalizedQuery, tokens) }))
      .filter(({ score }) => score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.file.skillName.localeCompare(right.file.skillName) ||
          left.file.relativePath.localeCompare(right.file.relativePath)
      )
      .slice(0, boundedLimit)
      .map(({ file, score }) => {
        const lineIndex = matchingLine(file.lines, normalizedQuery, tokens)
        return {
          skill: file.skillName,
          path: file.relativePath,
          title: file.title,
          line: lineIndex + 1,
          score,
          snippet: boundedSnippet(file.lines, lineIndex),
          uri: file.uri,
        }
      })
  }
}

export async function loadCatalog(options = {}) {
  const skillsDirectory = await resolveSkillsDirectory(options.skillsDir)
  const entries = await readdir(skillsDirectory, { withFileTypes: true })
  const skillDirectories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .sort((left, right) => left.name.localeCompare(right.name))

  if (skillDirectories.length === 0) {
    throw new Error(`No skill directories found in ${skillsDirectory}`)
  }

  const skills = []
  const files = []

  for (const directory of skillDirectories) {
    const skillName = directory.name
    const skillDirectory = resolve(skillsDirectory, skillName)
    const markdownFiles = await collectMarkdownFiles(skillDirectory)
    const loadedFiles = []

    for (const markdownFile of markdownFiles) {
      const content = await readFile(markdownFile.absolutePath, 'utf8')
      const metadata = parseFrontmatter(content, markdownFile.absolutePath)
      const id = fileId(skillName, markdownFile.relativePath)
      const description =
        typeof metadata.description === 'string' ? metadata.description.trim() : ''

      const loadedFile = {
        id,
        uri: fileUri(id),
        skillName,
        relativePath: markdownFile.relativePath,
        title: markdownTitle(content, metadata, markdownFile.relativePath),
        description,
        content,
        normalizedContent: content.toLowerCase(),
        lines: content.split('\n'),
      }

      loadedFiles.push(loadedFile)
      files.push(loadedFile)
    }

    const skillFile = loadedFiles.find((file) => file.relativePath === 'SKILL.md')
    if (!skillFile) throw new Error(`Missing SKILL.md for ${skillName}`)

    const skillMetadata = parseFrontmatter(skillFile.content, `${skillName}/SKILL.md`)
    const description =
      typeof skillMetadata.description === 'string'
        ? skillMetadata.description.trim()
        : skillFile.description

    skills.push({
      name: skillName,
      description,
      content: skillFile.content,
      fileCount: loadedFiles.length,
      files: loadedFiles,
    })
  }

  return new SkillsCatalog(skillsDirectory, skills, files)
}
