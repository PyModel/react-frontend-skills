// Comment syntax per file type. Elsewhere a `//` only counts at the start of a line (as before
// masking existed), since CSS `url(https://…)` and Markdown prose use it as text.
const LINE_COMMENT_FILES = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|html|scss|sass|less|json)$/
const BLOCK_COMMENT_FILES = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|html|css|scss|sass|less|pcss|postcss|json)$/
const HTML_COMMENT_FILES = /\.(?:html|vue|svelte|astro|mdx)$/
const SCRIPT_FILES = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|html|mdx)$/
// Files that can hold CSS, so an unquoted url(/path) is skipped as text.
const URL_FILES = /\.(?:css|scss|sass|less|pcss|postcss|html|vue|svelte|astro)$/
// A `/` after one of these (or at the start of the text) opens a regex literal, not a division.
// `}` and `)` are left out: JSX `{b} />`, `{a}/{b}` and Vue `{{a}}/{{b}}` put a slash there.
const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', ';', '+', '-', '*', '%', '~', '^'])
const KEYWORD_BEFORE_REGEX = /(?:^|[^\w$.])(?:return|typeof|case|void|yield|await|delete|throw|in|of|else|do)\s*$/

// Blank out comments, keeping offsets and newlines, so migration notes that name an old API
// are not reported. Quotes are tracked so "https://…" survives; '…' and "…" end at a newline,
// so a stray apostrophe in JSX text affects only its own line.
// An unclosed /* or <!-- (a JS syntax error) masks only the rest of its line, so a stray
// opener can never hide the remainder of the file. Template `${…}` expressions are code, and
// one-line regex literals and unquoted CSS url(…) are skipped as text.
// ponytail: a regex that spans an escaped newline or follows `)` reads as division.
export function maskComments(text, file) {
  const lineComments = LINE_COMMENT_FILES.test(file)
  const blockComments = BLOCK_COMMENT_FILES.test(file)
  const htmlComments = HTML_COMMENT_FILES.test(file)
  // Searches run at rising offsets, so each needle caches its last hit: the first match after
  // an earlier offset is still the first after any later offset up to it. Without this, a long
  // line or many unclosed openers rescan the rest of the text per character (quadratic).
  const found = new Map()
  const find = (needle, from) => {
    const last = found.get(needle)
    if (last && from >= last.from && (last.at === -1 || from <= last.at)) return last.at
    const at = text.indexOf(needle, from)
    found.set(needle, { from, at })
    return at
  }
  const lineEnd = (from) => {
    const newline = find('\n', from)
    return newline === -1 ? text.length : newline
  }
  const closeAfter = (closer, from) => {
    const close = find(closer, from)
    return close === -1 ? lineEnd(from) : close + closer.length
  }
  // Offset before which a failed regex or url( lookup already showed there is none on the line.
  let plainUntil = -1
  const atLineStart = (at) => {
    while (at > 0 && (text[at - 1] === ' ' || text[at - 1] === '\t')) at--
    return at === 0 || text[at - 1] === '\n'
  }
  const script = SCRIPT_FILES.test(file)
  const urls = URL_FILES.test(file)
  // End of a one-line regex literal opened at `from`, or -1 when the line ends first or the
  // closing slash would start a `//` or `/*` comment (then it was never a regex).
  const regexEnd = (from) => {
    let inClass = false
    for (let at = from + 1; at < text.length && text[at] !== '\n'; at++) {
      if (text[at] === '\\') at++
      else if (text[at] === '[') inClass = true
      else if (text[at] === ']') inClass = false
      else if (text[at] === '/' && !inClass) return text[at + 1] === '/' || text[at + 1] === '*' ? -1 : at
    }
    return -1
  }
  const out = text.split('')
  let quote
  let depth = 0
  // Brace depth at each open template `${`; its matching `}` resumes the template text.
  const templates = []
  let previous = ''
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (quote) {
      if (char === '\\') index++
      else if (quote === '`' && char === '$' && text[index + 1] === '{') {
        templates.push(depth)
        quote = undefined
        previous = '{'
        index++
      } else if (char === quote || (char === '\n' && quote !== '`')) quote = undefined
      continue
    }
    if (char === '\\') {
      index++
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      previous = char
      continue
    }
    if (char === '{') depth++
    else if (char === '}') {
      if (templates.length && templates.at(-1) === depth) {
        templates.pop()
        quote = '`'
        previous = '`'
        continue
      }
      depth--
    }
    if (
      index >= plainUntil && script && char === '/' && text[index + 1] !== '/' && text[index + 1] !== '*' &&
      (previous === '' || REGEX_PRECEDERS.has(previous) || KEYWORD_BEFORE_REGEX.test(text.slice(Math.max(0, index - 12), index)))
    ) {
      const close = regexEnd(index)
      if (close !== -1) {
        index = close
        previous = '/'
        continue
      }
      plainUntil = lineEnd(index)
    }
    if (index >= plainUntil && urls && !/[\w-]/.test(text[index - 1] ?? '') && /^url\([ \t]*[^'"\s)]/.test(text.slice(index, index + 6))) {
      const end = lineEnd(index)
      const close = find(')', index)
      if (close !== -1 && close < end) {
        index = close
        previous = ')'
        continue
      }
      plainUntil = end
    }
    let end
    if (char === '/' && text[index + 1] === '*' && (blockComments || atLineStart(index))) {
      end = blockComments ? closeAfter('*/', index + 2) : lineEnd(index)
    } else if (char === '/' && text[index + 1] === '/' && (lineComments || atLineStart(index))) end = lineEnd(index)
    else if (htmlComments && text.startsWith('<!--', index)) end = closeAfter('-->', index + 4)
    else {
      if (!/\s/.test(char)) previous = char
      continue
    }
    for (let at = index; at < end; at++) if (out[at] !== '\n') out[at] = ' '
    index = end - 1
  }
  return out.join('')
}
