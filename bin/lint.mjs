import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PACKAGES } from './packages.mjs'

export const SKILLS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'skills')

// Every installed skill's name + description rides in the agent's system prompt on every
// message, so the budgets cap the whole pack, not each skill (tokens ≈ chars / 4).
const RESIDENT_TOKEN_BUDGET = 280
const DESCRIPTION_WORD_BUDGET = 120
const DESCRIPTION_LIST_ITEM_BUDGET = 15

function frontmatter(text) {
  if (!text.startsWith('---\n')) return undefined
  const end = text.indexOf('\n---\n', 4)
  return end === -1 ? undefined : text.slice(4, end)
}

// GitHub's heading slug: inline links keep their text, emphasis markers go, then lowercase, drop
// punctuation (Unicode letters, digits, `_` and `-` stay), and turn spaces into hyphens.
function githubSlug(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(^|\s)[*_]+|[*_]+(?=\s|$)/g, '$1')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-')
}

// Anchors GitHub generates for a Markdown file: headings outside code fences, with a `-1`, `-2`
// suffix on repeats.
export function headingAnchors(markdown) {
  const anchors = new Set()
  let fence
  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1]
    if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length))) {
      fence = fence ? undefined : marker
      continue
    }
    if (fence) continue
    const heading = /^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$/.exec(line)?.[1]
    if (heading === undefined) continue
    const base = githubSlug(heading)
    let anchor = base
    for (let count = 1; anchors.has(anchor); count++) anchor = `${base}-${count}`
    anchors.add(anchor)
  }
  return anchors
}

function decodeFragment(fragment) {
  try {
    return decodeURIComponent(fragment).toLowerCase()
  } catch {
    return fragment.toLowerCase()
  }
}

export function lint(skillsDir = SKILLS_DIR) {
  const errors = []
  const ruleCounts = new Map()
  const resident = { tokens: 0, words: 0, listItems: 1 }
  const skillNames = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()

  for (const name of skillNames) {
    const dir = join(skillsDir, name)
    const at = (message) => errors.push(`${name}: ${message}`)
    if (!existsSync(join(dir, 'SKILL.md'))) {
      at('missing SKILL.md')
      continue
    }
    // Normalize CRLF (Windows checkouts with autocrlf) so frontmatter fences still match.
    const text = readFileSync(join(dir, 'SKILL.md'), 'utf8').replace(/\r\n?/g, '\n')
    const meta = frontmatter(text)
    if (meta === undefined) {
      at('SKILL.md has no closed frontmatter')
      continue
    }
    if (!new RegExp(`^name: ${name}$`, 'm').test(meta)) at(`frontmatter name must be "${name}"`)
    const rawDescription = /^description: (.+)$/m.exec(meta)?.[1].trim()
    const description = rawDescription?.replace(/^(['"])(.*)\1$/, '$2')
    if (!description) at('description must be a single-line "description: ..." entry')
    else {
      if (rawDescription === description && /: | #/.test(description)) {
        at('description contains ": " or " #"; quote it or YAML parsers reject the frontmatter')
      }
      resident.tokens += Math.ceil(`${name} ${description}`.length / 4)
      resident.words += description.split(/\s+/).length
      resident.listItems += description.split(',').length - 1
    }

    const body = text.slice(meta.length + 9)
    for (const [, target, fragment] of body.matchAll(/\]\(((?!https?:|mailto:)[^)#\s]*)(?:#([^)\s]*))?\)/g)) {
      if (!target && !fragment) continue
      const path = target ? join(dir, target) : join(dir, 'SKILL.md')
      if (!existsSync(path)) {
        at(`broken link ${target}`)
      } else if (fragment && path.endsWith('.md')) {
        if (!headingAnchors(readFileSync(path, 'utf8')).has(decodeFragment(fragment))) {
          at(`broken anchor ${target}#${fragment}`)
        }
      }
    }
    const ruleDir = ['references', 'rules'].find((candidate) => existsSync(join(dir, candidate)))
    if (!ruleDir) continue
    const markdown = readdirSync(join(dir, ruleDir)).filter((file) => file.endsWith('.md'))
    const rules = markdown.filter((file) => !file.startsWith('_'))
    ruleCounts.set(name, rules.length)
    // Every shipped file must be reachable from SKILL.md; an orphan is dead weight in the bundle.
    for (const file of markdown) {
      const indexed = !file.startsWith('_') && body.includes(`\`${file.slice(0, -3)}\``)
      if (!indexed && !body.includes(`${ruleDir}/${file}`)) at(`${ruleDir}/${file} is not indexed in SKILL.md`)
    }
    for (const [, count] of body.matchAll(/\b(\d+) rules\b/g)) {
      if (Number(count) !== rules.length) at(`SKILL.md claims ${count} rules, found ${rules.length}`)
    }
  }

  if (resident.tokens > RESIDENT_TOKEN_BUDGET) {
    errors.push(`descriptions cost ${resident.tokens} resident tokens (budget ${RESIDENT_TOKEN_BUDGET})`)
  }
  if (resident.words > DESCRIPTION_WORD_BUDGET) {
    errors.push(`descriptions total ${resident.words} words (budget ${DESCRIPTION_WORD_BUDGET})`)
  }
  if (resident.listItems > DESCRIPTION_LIST_ITEM_BUDGET) {
    errors.push(`descriptions total ${resident.listItems} comma-separated items (budget ${DESCRIPTION_LIST_ITEM_BUDGET})`)
  }

  const readme = join(skillsDir, '..', 'README.md')
  if (existsSync(readme)) {
    for (const [, name, count] of readFileSync(readme, 'utf8').matchAll(/^\| \[([\w-]+)\]\(skills\/\1\) \| (\d+) \|/gm)) {
      if (ruleCounts.get(name) !== Number(count)) {
        errors.push(`README.md lists ${count} rules for ${name}, found ${ruleCounts.get(name) ?? 'no skill'}`)
      }
    }
  }

  // The package map describes this pack; skip it when linting another skills tree.
  const ownSkills = resolve(skillsDir) === SKILLS_DIR
  for (const { skill } of ownSkills ? PACKAGES : []) {
    if (!skillNames.includes(skill)) errors.push(`package map names unknown skill ${skill}`)
  }
  return { skills: skillNames.length, resident, errors }
}
