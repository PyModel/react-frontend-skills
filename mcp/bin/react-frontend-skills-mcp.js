#!/usr/bin/env node

import { closeOnSignals } from '../src/lifecycle.js'
import { startStdioServer } from '../src/server.js'

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

async function main() {
  const { server } = await startStdioServer()

  closeOnSignals(server)
}

main().catch((error) => {
  process.stderr.write(`Unable to start React Frontend Skills MCP server: ${errorMessage(error)}\n`)
  process.exitCode = 1
})
