---
title: Use z.codec() for Bidirectional Transformations
impact: LOW-MEDIUM
impactDescription: one schema owns both the decode and encode direction
tags: zod, codec, transform, encode, decode
---

## Use z.codec() for Bidirectional Transformations

Since Zod 4.1, `z.codec()` defines a transformation in **both** directions: an input schema, an output schema, and `decode`/`encode` functions. Use it whenever the same data crosses a serialization boundary in both directions (JSON ↔ `Date`, string ↔ `bigint`, API rows ↔ domain objects) instead of pairing a one-way `.transform()` with a separate hand-written encoder that can silently drift.

**Incorrect (one-way transform plus a drifting inverse):**

```typescript
const storedDate = z.string().transform((s) => new Date(s))
// parse side is validated, but the encode side is ad-hoc:
const toStorage = (d: Date) => d.toISOString() // unchecked, duplicated
```

**Correct (codec owns both directions):**

```typescript
const stringToDate = z.codec(
  z.iso.datetime(), // input schema: ISO string
  z.date(),         // output schema: Date object
  {
    decode: (isoString) => new Date(isoString), // string → Date
    encode: (date) => date.toISOString(),       // Date → string
  },
)

stringToDate.decode('2024-01-15T10:30:00.000Z') // Date
stringToDate.encode(new Date('2024-01-15'))     // '2024-01-15T00:00:00.000Z'
```

**Notes:**

- `decode` runs the output schema's validation on its result, so malformed inputs are rejected like any parse — no post-transform type holes.
- Transformation functions may be `async`; awaiting the decode/encode call is required then.
- Zod Mini keeps bundle size down by exposing top-level equivalents: `z.decode(schema, value)` and `z.encode(schema, value)`.
- Keep one-way `.transform()` for pure derive-during-parse cases (e.g., trimming a string); reach for codecs only when the inverse matters.
