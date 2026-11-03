---
title: Define GraphQL Operations on a graphql.link()
impact: MEDIUM
impactDescription: graphql.query/mutation/operation no longer exist in MSW 3; links scope operations to an endpoint
tags: graphql, link, operation, query, mutation, matching, v3
---

## Define GraphQL Operations on a graphql.link()

MSW 3 GraphQL mocking is link-first. Create a link for the endpoint with `graphql.link(url)` and define handlers on it by operation name. Every GraphQL request goes to the same URL, so the operation name is the discriminator, and the link keeps same-named operations on different APIs apart.

On MSW 2.x: `import { graphql, HttpResponse } from 'msw'`, then `graphql.query('GetUser', resolver)` (also `graphql.mutation`, `graphql.operation`); 3.0 removed these.

**Incorrect (URL-based matching for GraphQL):**

```typescript
// All GraphQL requests go to /graphql - this catches everything!
http.post('/graphql', () => {
  return HttpResponse.json({ data: { user: { name: 'John' } } })
})
```

**Incorrect (2.x namespace methods, removed in MSW 3):**

```typescript
import { graphql, HttpResponse } from 'msw'

// 3.x: 'msw' no longer exports graphql, and graphql.query() was removed
graphql.query('GetUser', () => {
  return HttpResponse.json({ data: { user: { name: 'John' } } })
})
```

**Correct (link + operation-based matching):**

```typescript
import { HttpResponse } from 'msw/http'
import { graphql } from 'msw/graphql'

// Relative or absolute URL; wildcards and RegExp work too
const api = graphql.link('https://api.example.com/graphql')

export const handlers = [
  // Match query by operation name
  api.query('GetUser', () => {
    return HttpResponse.json({
      data: {
        user: {
          id: '1',
          name: 'John',
          email: 'john@example.com',
        },
      },
    })
  }),

  // Match mutation by operation name
  api.mutation('CreateUser', async ({ variables }) => {
    return HttpResponse.json({
      data: {
        createUser: {
          id: crypto.randomUUID(),
          name: variables.name,
          email: variables.email,
        },
      },
    })
  }),

  // Separate handlers for different queries
  api.query('GetUsers', () => {
    return HttpResponse.json({
      data: {
        users: [
          { id: '1', name: 'John' },
          { id: '2', name: 'Jane' },
        ],
      },
    })
  }),
]
```

**Access operation variables:**

```typescript
api.query('GetUser', ({ variables }) => {
  // variables matches your GraphQL query variables
  return HttpResponse.json({
    data: {
      user: {
        id: variables.id,
        name: 'John',
      },
    },
  })
})

// Query from client:
// query GetUser($id: ID!) { user(id: $id) { id name } }
// variables: { id: "123" }
```

**Multiple GraphQL APIs:**

```typescript
const github = graphql.link('https://api.github.com/graphql')
const stripe = graphql.link('https://api.stripe.com/graphql')

export const handlers = [
  // Same operation name, different endpoints, different mocks
  github.query('GetPayment', () =>
    HttpResponse.json({ data: { payment: { id: '1' } } }),
  ),
  stripe.query('GetPayment', () =>
    HttpResponse.json({ errors: [{ message: 'Cannot process payment' }] }),
  ),
]
```

**Notes:**

- The link also has `.operation(resolver)` (any operation, including anonymous ones) and `.subscription()` (see [graphql-subscriptions](graphql-subscriptions.md)).
- The operation name can be a `TypedDocumentNode` from GraphQL Code Generator; MSW infers the query and variable types from it.

**When NOT to use this pattern:**
- REST APIs should use `http.*` handlers, not GraphQL handlers

Reference: [MSW graphql API](https://mswjs.io/api/graphql)
