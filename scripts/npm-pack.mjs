// npm 10/11 print an array of pack results; npm 12 prints an object keyed by package name.
export function parsePackOutput(stdout) {
  const result = JSON.parse(stdout)
  const packed = Array.isArray(result) ? result[0] : Object.values(result)[0]
  if (!packed?.filename) throw new Error(`Unexpected npm pack --json output: ${stdout.slice(0, 200)}`)
  return packed
}

export function dotfilesIn(files) {
  return files.map((file) => file.path).filter((path) => /(^|\/)\./.test(path))
}
