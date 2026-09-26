---
name: tanstack-query
description: TanStack Query v5 data fetching and caching.
license: MIT
metadata:
  author: community
  version: "1.0.0"
---

# TanStack Query Best Practices

Comprehensive performance optimization guide for TanStack Query v5 applications. Contains 40 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new queries, mutations, or data fetching logic
- Implementing caching strategies (staleTime, gcTime)
- Reviewing code for performance issues or request waterfalls
- Refactoring existing TanStack Query code
- Implementing infinite queries, Suspense, or optimistic updates

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Key Structure | CRITICAL | `tquery-` |
| 2 | Caching Configuration | CRITICAL | `cache-` |
| 3 | Mutation Patterns | HIGH | `mutation-` |
| 4 | Prefetching & Waterfalls | HIGH | `prefetch-` |
| 5 | Infinite Queries | MEDIUM | `infinite-` |
| 6 | Suspense Integration | MEDIUM | `suspense-` |
| 7 | Error & Retry Handling | MEDIUM | `error-` |
| 8 | Render Optimization | LOW-MEDIUM | `render-` |

## Quick Reference

### 1. Query Key Structure (CRITICAL)

- `tquery-key-factories` - Use centralized query key factories
- `tquery-hierarchical-keys` - Structure keys from generic to specific
- `tquery-always-arrays` - Always use array query keys
- `tquery-serializable-objects` - Use serializable objects in keys
- `tquery-options-pattern` - Use queryOptions for type-safe sharing
- `tquery-colocate-keys` - Colocate query keys with features

### 2. Caching Configuration (CRITICAL)

- `cache-staletime-gctime` - Understand staleTime vs gcTime
- `cache-global-defaults` - Configure global defaults appropriately
- `cache-placeholder-vs-initial` - Use placeholderData vs initialData correctly
- `cache-invalidation-precision` - Invalidate with precision
- `cache-refetch-triggers` - Control automatic refetch triggers
- `cache-enabled-option` - Use enabled or skipToken for conditional queries

### 3. Mutation Patterns (HIGH)

- `mutation-optimistic-updates` - Implement optimistic updates with rollback
- `mutation-invalidate-onsettled` - Choose invalidation callbacks by mutation contract
- `mutation-cancel-queries` - Cancel queries before optimistic updates
- `mutation-setquerydata` - Use setQueryData for immediate cache updates
- `mutation-avoid-parallel` - Avoid parallel mutations on same data

### 4. Prefetching & Waterfalls (HIGH)

- `prefetch-avoid-waterfalls` - Avoid request waterfalls
- `prefetch-on-hover` - Prefetch on hover for perceived speed
- `prefetch-in-queryfn` - Start follow-up prefetches when keys become known
- `prefetch-server-components` - Prefetch in Server Components
- `prefetch-flatten-api` - Flatten API to reduce waterfalls

### 5. Infinite Queries (MEDIUM)

- `infinite-max-pages` - Limit infinite query pages with maxPages
- `infinite-flatten-pages` - Flatten pages for rendering
- `infinite-refetch-behavior` - Understand infinite query refetch behavior
- `infinite-loading-states` - Handle infinite query loading states correctly

### 6. Suspense Integration (MEDIUM)

- `suspense-use-suspense-hooks` - Use Suspense hooks for simpler loading states
- `suspense-error-boundaries` - Always pair Suspense with Error Boundaries
- `suspense-parallel-queries` - Combine Suspense queries with useSuspenseQueries
- `suspense-boundaries-placement` - Place Suspense boundaries strategically

### 7. Error & Retry Handling (MEDIUM)

- `error-retry-config` - Configure retry with exponential backoff
- `error-conditional-retry` - Use conditional retry based on error type
- `error-global-handler` - Use global error handler for common errors
- `error-display-patterns` - Display errors appropriately
- `error-throw-on-error` - Use throwOnError with Error Boundaries

### 8. Render Optimization (LOW-MEDIUM)

- `render-select-memoize` - Memoize select functions
- `render-select-derived` - Use select to derive data and reduce re-renders
- `render-notify-props` - Rely on tracked properties before notifyOnChangeProps
- `render-structural-sharing` - Understand structural sharing
- `render-tracked-props` - Preserve tracked-property optimization

## How to Use

Run in the project root first:

```bash
npx -y @pymodel/react-frontend-skills detect                       # installed vs. targeted versions
npx -y @pymodel/react-frontend-skills scan --skill tanstack-query  # deprecated APIs → rule IDs
```

Read `references/<rule-id>.md` for each rule above that matches the task and for each `scan` hit: why it matters, then incorrect vs. correct code.

## Related Skills

- For mocking API responses in tests, see `msw` skill
- For React 19 data fetching patterns, see `react` skill
