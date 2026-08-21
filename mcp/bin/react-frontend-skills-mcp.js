#!/usr/bin/env node

import { startStdioServer } from '../src/server.js'

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

async function main() {
  const { server } = await startStdioServer()
  let closing = false

  const shutdown = async (signal) => {
    if (closing) return
    closing = true

    try {
      await server.close()
      process.exitCode = 0
    } catch (error) {
      process.stderr.write(`Failed to close MCP server after ${signal}: ${errorMessage(error)}\n`)
      process.exitCode = 1
    }
  }

  process.once('SIGINT', () => void shutdown('SIGINT'))
  process.once('SIGTERM', () => void shutdown('SIGTERM'))
}

main().catch((error) => {
  process.stderr.write(`Unable to start React Frontend Skills MCP server: ${errorMessage(error)}\n`)
  process.exitCode = 1
})
