---
title: Compile Hot-Path Schemas with z.compile
impact: LOW-MEDIUM
impactDescription: z.compile (Zod 4.5+) generates a specialized parser for a finished schema; it only helps on hot parse paths and silently falls back when it cannot compile
tags: perf, compile, withParser, csp
---

## Compile Hot-Path Schemas with z.compile

`z.compile(schema)` (Zod 4.5+) returns a compiled copy of a schema that parses faster. The original schema is unchanged. On invalid input the compiled copy falls back to the normal parser, so the issues are identical.

It fails soft. A schema it cannot model comes back uncompiled, with no error. That covers async checks, recursive schemas, `z.coerce.*`, `z.xor`, `.catch(fn)` and checks with a custom `when`. Pass `{ strict: true }` to make that case throw.

**Incorrect (compiling before the schema is finished, or on every call):**

```typescript
import { z } from 'zod'

const Player = z.compile(z.object({ username: z.string(), xp: z.number() }))

// .extend() returns a new, uncompiled schema — the compile above is lost
const Ranked = Player.extend({ rank: z.number() })

export function handle(input: unknown) {
  // Compiling per call pays the code-generation cost on every request
  return z.compile(Ranked).parse(input)
}
```

**Correct (compile the final schema once, at module scope):**

```typescript
import { z } from 'zod'

const Ranked = z.object({ username: z.string(), xp: z.number(), rank: z.number() })

// Build the whole schema first (.extend, .refine, .pick …), compile last
export const RankedCompiled = z.compile(Ranked)

export function handle(input: unknown) {
  return RankedCompiled.parse(input)
}
```

```typescript
// In a test: prove it really compiled instead of silently falling back
import { expect, test } from 'vitest'

test('Ranked compiles', () => {
  expect(() => z.compile(Ranked, { strict: true })).not.toThrow()
})
```

**Environments without `new Function` (strict CSP):**

`z.compile` generates code with `new Function`. Where that is blocked, `z.withParser(schema, parser)` (Zod 4.6+) installs a parser you generated at build time. Return `z.INVALID` to hand the input back to Zod's runtime parser, which then builds the `ZodError`.

```typescript
import { z } from 'zod'
import { isPlayer } from './generated/player-parser' // emitted by a build-time compiler

const Player = z.object({ username: z.string(), xp: z.number() })

const PlayerFast = z.withParser(Player, (input) =>
  isPlayer(input) ? { username: input.username, xp: input.xp } : z.INVALID,
)
```

Zod does not re-check a result that `withParser` reports as a success. A parser returning `{ username: 'forged', xp: 0 }` for any input makes `.parse('not an object')` succeed. Only install generated parsers, and have them strip unknown keys and return `z.INVALID` whenever they are unsure.

**When NOT to use this pattern:**
- Cold paths such as config loading or one-off form submits: the compile cost outweighs the gain
- Schemas that must stay extendable at runtime: derived schemas come back uncompiled
- Measure first: see `perf-cache-schemas` and `perf-avoid-dynamic-creation` for the cheaper wins

Reference: [Zod - Compile](https://zod.dev/compile) · [Zod 4.5.0 release](https://github.com/colinhacks/zod/releases/tag/v4.5.0) · [Zod 4.6.0 release](https://github.com/colinhacks/zod/releases/tag/v4.6.0)
