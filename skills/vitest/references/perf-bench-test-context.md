---
title: Write Benchmarks with the bench Test Fixture
impact: MEDIUM
impactDescription: Using bench outside a test context throws; the fixture also enables comparison and regression assertions
tags: perf, bench, benchmark, performance-regression
---

## Write Benchmarks with the bench Test Fixture

`bench` is a test-context fixture, not an export of `vitest`. Benchmarks live in `*.bench.ts` (or `*.benchmark.ts`) files, run with `vitest bench`, and are skipped by `vitest run`. Using the fixture in a regular test file throws.

**Incorrect (fixture used outside a test):**

```typescript
// sort.bench.ts
import { bench } from 'vitest' // bench is not exported from vitest

bench('toSorted', () => { input.toSorted((a, b) => a - b) }) // no test context: throws
```

**Correct (fixture, compare, assert):**

```typescript
// lookup.bench.ts
import { expect, test } from 'vitest'

const ids = Array.from({ length: 10_000 }, (_, i) => `id-${i}`)
const asSet = new Set(ids)

test('Set lookup beats Array.includes', async ({ bench }) => {
  const result = await bench.compare(
    bench('Set.has', () => { asSet.has('id-9999') }),
    bench('Array.includes', () => { ids.includes('id-9999') }),
    { time: 200 },
  )

  // Fails the run on a performance regression; delta tolerates noise
  expect(result.get('Set.has')).toBeFasterThan(result.get('Array.includes'), { delta: 0.1 })
})
```

```bash
npx vitest bench --run   # runs only *.bench.ts files
```

**Notes:**
- Result statistics live under `.throughput` and `.latency`, e.g. `result.get('Set.has').throughput.mean`. There is no top-level `.mean`.
- The options argument goes between the name and the function: `bench(name, options, fn)`.
- For machine-readable output, use `--reporter=json`; it replaces `--outputJson`.

**When NOT to use this pattern:**
- Micro-optimizations without a real hot path; profile the app first
- Asserting absolute timings (`mean < 5ms`): they vary by CI machine, so compare against a baseline instead

Reference: [Vitest Benchmarking](https://vitest.dev/guide/benchmarking)
