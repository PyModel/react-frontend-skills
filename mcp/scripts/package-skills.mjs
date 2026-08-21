import { cp, readdir, rm, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceSkills = resolve(packageRoot, '..', 'skills')
const generatedData = resolve(packageRoot, 'data')
const packagedSkills = resolve(generatedData, 'skills')

async function assertSkillsDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const skillNames = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()

  if (skillNames.length !== 18) {
    throw new Error(`Expected 18 skill directories in ${directory}, found ${skillNames.length}`)
  }

  await Promise.all(
    skillNames.map(async (skillName) => {
      const skillFile = resolve(directory, skillName, 'SKILL.md')
      const details = await stat(skillFile)
      if (!details.isFile()) {
        throw new Error(`Missing SKILL.md for ${skillName}`)
      }
    })
  )
}

async function prepare() {
  await assertSkillsDirectory(sourceSkills)
  await rm(packagedSkills, { recursive: true, force: true })
  await cp(sourceSkills, packagedSkills, {
    recursive: true,
    filter: (source) => !source.endsWith('.DS_Store'),
  })
  await assertSkillsDirectory(packagedSkills)
}

async function clean() {
  await rm(generatedData, { recursive: true, force: true })
}

const command = process.argv[2]

if (command === 'prepare') {
  await prepare()
} else if (command === 'clean') {
  await clean()
} else {
  throw new Error('Usage: node scripts/package-skills.mjs <prepare|clean>')
}
