---
title: Use Sharding for CI Parallelization
impact: HIGH
impactDescription: Linear speedup with additional CI nodes (3 nodes = ~3× faster)
tags: perf, sharding, ci, parallel, github-actions
---

## Use Sharding for CI Parallelization

Sharding splits your test suite across multiple CI machines. Each machine runs a subset of tests in parallel, providing near-linear speedup with additional nodes.

**Without sharding (single node):**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx vitest run
```

**Incorrect (blobs and coverage never reach the merge job):**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - run: npx vitest run --shard=${{ matrix.shard }}/3        # no blob written
  merge:
    needs: test
    steps:
      - uses: actions/download-artifact@v4                       # nothing was uploaded
      - run: npx vitest --merge-reports --coverage
      # Fails with ENOENT on .vitest/blob. With blobs but without --coverage
      # on the shards, it reports "Unknown% (0/0)" and still exits 0.
```

**Correct (blob + coverage on every shard, upload, merge):**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24 }
      - run: npm ci
      - run: npx vitest run --reporter=blob --coverage --shard=${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: vitest-results-${{ matrix.shard }}  # unique per shard
          path: .vitest                             # Vitest 5 writes blobs to .vitest/blob
          include-hidden-files: true                # .vitest is a dot-directory
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24 }
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          path: .vitest
          merge-multiple: true  # blob file names include the shard, so they don't collide
      - run: npx vitest run --merge-reports --coverage
```

Pass `--coverage` both on every shard and on the merge. Blobs carry the coverage data; the merge only combines it.

**Optimal shard count:**

| Test Suite Size | Recommended Shards |
|-----------------|-------------------|
| < 100 tests | 1-2 |
| 100-500 tests | 2-4 |
| 500-1000 tests | 4-6 |
| > 1000 tests | 6-10 |

**Benefits:**
- Near-linear speedup with additional nodes
- Merged coverage and reports
- Works with any CI system

Reference: [Vitest Test Sharding](https://vitest.dev/guide/improving-performance#sharding) · [actions/upload-artifact](https://github.com/actions/upload-artifact)
