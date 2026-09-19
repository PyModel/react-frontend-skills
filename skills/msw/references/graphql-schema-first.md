---
title: Resolve Operations Against a GraphQL Schema
impact: MEDIUM
impactDescription: schema-accurate mocks without hand-writing response shapes
tags: msw, graphql, schema, operation
---

## Resolve Operations Against a GraphQL Schema

Instead of hand-writing every mocked GraphQL response, execute intercepted operations against a real schema with the `graphql` package inside a `graphql.operation()` catch-all handler. Responses stay schema-valid as operations evolve, and resolvers live in one place.

**Incorrect (hand-maintained response shapes per operation):**

```typescript
// Every handler duplicates the response shape; a schema change
// silently leaves stale mocks that no longer match production
export const handlers = [
  graphql.query('GetUser', () =>
    HttpResponse.json({ data: { user: { id: '1', firstName: 'John' } } }),
  ),
  graphql.query('GetUserWithPosts', () =>
    HttpResponse.json({
      data: { user: { id: '1', firstName: 'John', posts: [] } },
    }),
  ),
]
```

**Correct (schema-first resolution):**

```typescript
import { graphql, HttpResponse } from 'msw'
import { graphql as executeGraphql, buildSchema } from 'graphql'

const schema = buildSchema(`
  type User {
    id: ID!
    firstName: String!
  }

  type Query {
    user(id: ID!): User
  }
`)

const data = {
  users: [
    { id: '1', name: 'John' },
    { id: '2', name: 'Kate' },
  ],
}

export const handlers = [
  graphql.operation(async ({ query, variables }) => {
    const { data, errors } = await executeGraphql({
      schema,
      source: query,
      variableValues: variables,
      rootValue: {
        user(args) {
          return data.users.find((user) => user.id === args.id)
        },
      },
    })

    return HttpResponse.json({ data, errors })
  }),
]
```

**Notes:**

- `graphql.operation()` matches every operation; place more specific named-operation handlers above it when you need per-test overrides.
- The `graphql` package (`buildSchema`, `graphql()`) is a peer dependency you install alongside MSW.
- Because resolution runs against the schema, invalid client queries surface real GraphQL `errors` in the mocked response — useful for testing error UI.
- Pair with [graphql-operation-handlers](graphql-operation-handlers.md) for targeted overrides and [graphql-error-responses](graphql-error-responses.md) for error-shape rules.
