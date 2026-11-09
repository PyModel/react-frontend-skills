---
title: Access GraphQL Variables Correctly
impact: MEDIUM
impactDescription: Enables dynamic mock responses based on query input
tags: graphql, variables, dynamic, input, resolver
---

## Access GraphQL Variables Correctly

Access GraphQL variables through the `variables` property in the resolver argument. Use them to return dynamic responses based on query input.

**Incorrect (ignoring variables):**

```typescript
// Returns same user regardless of which ID is requested
api.query('GetUser', () => {
  return HttpResponse.json({
    data: {
      user: { id: '1', name: 'John' },
    },
  })
})
```

**Correct (using variables for dynamic responses):**

```typescript
import { HttpResponse } from 'msw/http'
import { graphql } from 'msw/graphql'

const api = graphql.link('/graphql')

// Mock data store
const users = new Map([
  ['1', { id: '1', name: 'John', email: 'john@example.com' }],
  ['2', { id: '2', name: 'Jane', email: 'jane@example.com' }],
])

export const handlers = [
  api.query('GetUser', ({ variables }) => {
    const user = users.get(variables.id)

    if (!user) {
      return HttpResponse.json({
        data: null,
        errors: [{ message: 'User not found' }],
      })
    }

    return HttpResponse.json({
      data: { user },
    })
  }),

  // Mutation with input variables
  api.mutation('UpdateUser', ({ variables }) => {
    const { id, input } = variables
    const existingUser = users.get(id)

    if (!existingUser) {
      return HttpResponse.json({
        data: null,
        errors: [{ message: 'User not found' }],
      })
    }

    const updatedUser = { ...existingUser, ...input }
    users.set(id, updatedUser)

    return HttpResponse.json({
      data: { updateUser: updatedUser },
    })
  }),

  // Pagination with variables
  api.query('GetUsers', ({ variables }) => {
    const { first = 10, after } = variables
    const allUsers = Array.from(users.values())

    let startIndex = 0
    if (after) {
      startIndex = allUsers.findIndex((u) => u.id === after) + 1
    }

    const pageUsers = allUsers.slice(startIndex, startIndex + first)
    const hasNextPage = startIndex + first < allUsers.length

    return HttpResponse.json({
      data: {
        users: {
          edges: pageUsers.map((user) => ({
            node: user,
            cursor: user.id,
          })),
          pageInfo: {
            hasNextPage,
            endCursor: pageUsers[pageUsers.length - 1]?.id,
          },
        },
      },
    })
  }),
]
```

**Type-safe variables:**

```typescript
type GetUserQuery = {
  user: { id: string; name: string }
}

type GetUserVariables = {
  id: string
}

// Generics are <Query, Variables>; Variables is the second argument
api.query<GetUserQuery, GetUserVariables>('GetUser', ({ variables }) => {
  // variables.id is typed as string
  return HttpResponse.json({
    data: {
      user: { id: variables.id, name: 'John' },
    },
  })
})
```

**When NOT to use this pattern:**
- Queries without variables don't need variable access

Reference: [MSW GraphQL Intercepting Operations](https://mswjs.io/docs/graphql/intercepting-operations)
