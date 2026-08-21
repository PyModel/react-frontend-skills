# React Frontend Skills MCP

Read-only Model Context Protocol server for the 18 skills in [`PyModel/react-frontend-skills`](https://github.com/PyModel/react-frontend-skills).

The npm package is self-contained: every Markdown skill and reference file is copied into the package tarball during `npm pack`/`npm publish`. Runtime access does not require a network connection or a repository checkout.

## Install

Run directly with npm:

```bash
npx -y @pymodel/react-frontend-skills-mcp
```

For MCP clients that use an `mcpServers` JSON object:

```json
{
  "mcpServers": {
    "react-frontend-skills": {
      "command": "npx",
      "args": ["-y", "@pymodel/react-frontend-skills-mcp"]
    }
  }
}
```

The server uses stdio transport. Do not wrap it with a command that writes non-protocol output to stdout.

## Tools

| Tool | Purpose |
| --- | --- |
| `list_skills` | List all skills with descriptions, file counts, and resource URIs. |
| `search_skills` | Search documentation with an optional exact skill filter and a bounded result count. |
| `get_skill` | Return the complete `SKILL.md` for an exact skill name. |
| `get_reference` | Return one Markdown file by skill name and relative path. |

All tools declare read-only, non-destructive, idempotent annotations. Search returns source paths, line numbers, excerpts, scores, and resource URIs. Results are capped at 20 entries per call.

## Resources

- `react-skills://catalog` — JSON catalog of all skills.
- `react-skills://file/{id}` — complete Markdown skill or reference file.

`resources/list` enumerates every available Markdown file, so clients can discover and read source material without guessing paths.

## Local development

From the repository root:

```bash
cd mcp
npm install
npm test
npm run check
npm pack --dry-run
```

During repository development, the server reads `../skills`. Published tarballs read the generated `data/skills` directory. To test another trusted checkout explicitly:

```bash
REACT_FRONTEND_SKILLS_DIR=/absolute/path/to/skills npm start
```

The configured directory must exist and contain skill folders with `SKILL.md` files. Tool inputs never become filesystem paths; files are indexed at startup and served from the in-memory catalog.

## Packaging

`prepack` copies the repository's canonical `skills/` tree into `data/skills`. `postpack` removes that generated directory so duplicated skill content is not committed. Packaging fails unless all 18 skill directories and their `SKILL.md` files are present.

## Requirements

- Node.js 20 or newer
- An MCP client with stdio support

## License

MIT © 2026 Mohamed Elkholy
