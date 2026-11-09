---
name: msw
description: MSW 3 API mocking for tests.
---

# MSW Best Practices

Comprehensive API mocking guide for MSW 3 applications (current: MSW 3.0.4), designed for AI agents and LLMs. Contains 51 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## Version

Targets MSW 3.x (Node.js 22+). Check the `msw` version in `package.json` or run `npx -y @pymodel/react-frontend-skills detect`.

**Relative handler paths:** in the browser and in jsdom/happy-dom, a relative path resolves against `location.href`. In a pure Node environment there is no `location`, so use an absolute URL or `*/path` (see `handler-absolute-urls`).

## When to Apply

Reference these guidelines when:
- Setting up MSW for testing or development
- Writing or organizing request handlers
- Configuring test environments with MSW
- Mocking REST or GraphQL APIs
- Debugging handler matching issues
- Testing error states and edge cases

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Setup & Initialization | CRITICAL | `setup-` |
| 2 | Handler Architecture | CRITICAL | `handler-` |
| 3 | Test Integration | HIGH | `test-` |
| 4 | Response Patterns | HIGH | `response-` |
| 5 | Request Matching | MEDIUM-HIGH | `match-` |
| 6 | GraphQL Mocking | MEDIUM | `graphql-` |
| 7 | Advanced Patterns | MEDIUM | `advanced-` |
| 8 | Debugging & Performance | LOW | `debug-` |

## Quick Reference

### 1. Setup & Initialization (CRITICAL)

- `setup-server-node-entrypoint` - Use the correct entrypoint for Node.js (msw/node)
- `setup-v3-handler-entrypoints` - Import graphql from msw/graphql; http, HttpResponse, ws, sse and utilities come from msw
- `setup-lifecycle-hooks` - Configure server lifecycle in test setup
- `setup-worker-script-commit` - Commit worker script to version control
- `setup-vite-plugin` - Serve the worker and enable mocking with the msw/vite plugin
- `setup-node-version` - Require Node.js 22+
- `setup-unhandled-requests` - Configure unhandled request behavior with onUnhandledFrame
- `setup-typescript-config` - Configure TypeScript for MSW

### 2. Handler Architecture (CRITICAL)

- `handler-happy-path-first` - Define happy path handlers as baseline
- `handler-domain-grouping` - Group handlers by domain
- `handler-absolute-urls` - Use absolute URLs in Node handlers
- `handler-shared-resolvers` - Extract shared response logic into resolvers
- `handler-v2-response-syntax` - Return an HttpResponse from every resolver
- `handler-request-body-parsing` - Explicitly parse request bodies
- `handler-resolver-argument` - Destructure resolver arguments correctly
- `handler-reusability-environments` - Share handlers across environments

### 3. Test Integration (HIGH)

- `test-reset-handlers` - Reset handlers after each test
- `test-avoid-request-assertions` - Avoid direct request assertions
- `test-concurrent-boundary` - Use server.boundary() for concurrent tests
- `test-fake-timers-config` - Configure fake timers to preserve queueMicrotask
- `test-async-utilities` - Use async testing utilities for mock responses
- `test-clear-request-cache` - Clear request library caches between tests
- `test-jsdom-environment` - Use correct JSDOM environment for Jest

### 4. Response Patterns (HIGH)

- `response-http-response-helpers` - Use HttpResponse static methods
- `response-delay-realistic` - Add delays only for timing behavior under test
- `response-error-simulation` - Simulate error responses correctly
- `response-one-time-handlers` - Use one-time handlers for sequential scenarios
- `response-custom-headers` - Set response headers correctly
- `response-streaming` - Mock streaming responses with ReadableStream

### 5. Request Matching (MEDIUM-HIGH)

- `match-url-patterns` - Use URL path parameters correctly
- `match-query-params` - Access query parameters from request URL
- `match-custom-predicate` - Use custom predicates for complex matching
- `match-http-methods` - Match HTTP methods explicitly
- `match-handler-order` - Order handlers from specific to general

### 6. GraphQL Mocking (MEDIUM)

- `graphql-operation-handlers` - Define operations on a graphql.link() by operation name
- `graphql-error-responses` - Return GraphQL errors in correct format
- `graphql-batched-queries` - Handle batched GraphQL queries
- `graphql-variables-access` - Access GraphQL variables correctly
- `graphql-schema-first` - Resolve operations against a GraphQL schema
- `graphql-subscriptions` - Mock GraphQL subscriptions with link.subscription()

### 7. Advanced Patterns (MEDIUM)

- `advanced-bypass-requests` - Use bypass() for passthrough requests
- `advanced-cookies-auth` - Handle cookies and authentication
- `advanced-dynamic-scenarios` - Implement dynamic mock scenarios
- `advanced-vitest-browser` - Configure MSW for Vitest browser mode
- `advanced-file-uploads` - Mock file upload endpoints
- `advanced-websocket-mocking` - Mock WebSocket connections with ws.link
- `advanced-playwright-integration` - Use defineNetworkFixture from @msw/playwright

### 8. Debugging & Performance (LOW)

- `debug-lifecycle-events` - Use lifecycle events for debugging
- `debug-verify-interception` - Verify request interception is working
- `debug-common-issues` - Know common MSW issues and fixes
- `debug-request-logging` - Log request details for debugging

## How to Use

Run in the project root first:

```bash
npx -y @pymodel/react-frontend-skills detect   # installed vs. targeted versions
```

Read `references/<rule-id>.md` for each rule above that matches the task: why it matters, then incorrect vs. correct code.

## Related Skills

- For consuming mocked APIs, see `tanstack-query` skill
- For test framework patterns, see `vitest`; for methodology, see `tdd`
