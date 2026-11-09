const reportToStderr = (signal, error) => {
  process.stderr.write(`Failed to close MCP server after ${signal}: ${error instanceof Error ? error.message : String(error)}\n`)
}

export function closeOnSignals(server, { proc = process, onError = reportToStderr } = {}) {
  let closing = false

  const shutdown = async (signal) => {
    if (closing) return
    closing = true

    try {
      await server.close()
      proc.exitCode = 0
    } catch (error) {
      proc.exitCode = 1
      onError(signal, error)
    }
  }

  proc.once('SIGINT', () => void shutdown('SIGINT'))
  proc.once('SIGTERM', () => void shutdown('SIGTERM'))
}
