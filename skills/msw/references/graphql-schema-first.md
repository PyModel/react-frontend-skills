---
title: Resolve Operations Against a GraphQL Schema
impact: MEDIUM
impactDescription: schema-accurate mocks without hand-writing response shapes
tags: msw, graphql, schema, operation
---

## Resolve Operations Against a GraphQL Schema

Instead of hand-writing every mocked GraphQL response, execute intercepted operations against a real schema with the `graphql` package inside an `.operation()` catch-all handler on a `graphql.link()`. Responses stay schema-valid as operations evolve, and resolvers live in one place.

**Incorrect (hand-maintained response shapes per operation):**

```typescript
// Every handler duplicates the response shape; a schema change
// silently leaves stale mocks that no longer match production
export const handlers = [
  api.query('GetUser', () =>
    HttpResponse.json({ data: { user: { id: '1', firstName: 'John' } } }),
  ),
  api.query('GetUserWithPosts', () =>
    HttpResponse.json({
      data: { user: { id: '1', firstName: 'John', posts: [] } },
    }),
  ),
]
```

**Correct (schema-first resolution):**

```typescript
import { HttpResponse } from 'msw/http'
import { graphql } from 'msw/graphql'
import { graphql as executeGraphql, buildSchema } from 'graphql'

const api = graphql.link('/graphql')

const schema = buildSchema(`
  type User {
    id: ID!
    firstName: String!
  }

  type Query {
    user(id: ID!): User
  }
`)

const db = {
  users: [
    { id: '1', firstName: 'John' },
    { id: '2', firstName: 'Kate' },
  ],
}

export const handlers = [
  api.operation(async ({ query, variables }) => {
    const { data, errors } = await executeGraphql({
      schema,
      source: query,
      variableValues: variables,
      rootValue: {
        user(args) {
          return db.users.find((user) => user.id === args.id)
        },
      },
    })

    return HttpResponse.json({ data, errors })
  }),
]
```

**Notes:**

- `api.operation()` matches every operation; place more specific named-operation handlers above it when you need per-test overrides.
- The `graphql` package (`buildSchema`, `graphql()`) is an optional peer dependency of MSW; install it yourself.
- Because resolution runs against the schema, invalid client queries surface real GraphQL `errors` in the mocked response — useful for testing error UI.
- Pair with [graphql-operation-handlers](graphql-operation-handlers.md) for targeted overrides and [graphql-error-responses](graphql-error-responses.md) for error-shape rules.
