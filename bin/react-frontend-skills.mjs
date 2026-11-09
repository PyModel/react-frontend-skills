#!/usr/bin/env node
// Deterministic companion CLI for the React Frontend Skills.
// Agents run `detect` and `scan` in a user project; maintainers run `lint` in this repo.
// Zero dependencies: this file ships inside the npm package and runs through npx.

import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { main, USAGE } from './cli.mjs'
import { UsageError } from './errors.mjs'

// npx runs this through a node_modules/.bin symlink, so compare real paths.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof UsageError ? `${error.message}\n\n${USAGE}` : error.message)
    process.exitCode = error instanceof UsageError ? 2 : 1
  }
}
