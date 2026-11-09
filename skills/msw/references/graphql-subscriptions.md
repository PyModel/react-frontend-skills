---
title: Mock GraphQL Subscriptions with link.subscription()
impact: MEDIUM
impactDescription: tests realtime GraphQL UI through the client's real subscription transport
tags: graphql, subscription, websocket, realtime
---

## Mock GraphQL Subscriptions with link.subscription()

MSW intercepts GraphQL subscriptions sent over WebSocket. Define them with `.subscription()` on a `graphql.link()`. The resolver returns nothing; drive the subscription through the `subscription` object instead (`publish`, `from`, `error`, `complete`, `passthrough`).

**Incorrect (stubbing the subscription client):**

```typescript
// Replaces the client's subscribe() so the transport, message
// parsing and cache updates are never exercised
vi.spyOn(client, 'subscribe').mockReturnValue(
  of({ data: { commentAdded: { text: 'Hello world!' } } }),
)
```

**Correct (intercept the subscription):**

```typescript
import { graphql } from 'msw/graphql'

const api = graphql.link('https://api.example.com/graphql')

export const handlers = [
  api.subscription('OnCommentAdded', ({ subscription }) => {
    const { postId } = subscription.variables

    subscription.publish({
      data: { commentAdded: { postId, text: 'Hello world!' } },
    })
  }),
]
```

**Publish a sequence, error or complete:**

```typescript
api.subscription('OnCommentAdded', ({ subscription }) => {
  // Each yielded value is published as the payload's `data`
  subscription.from(async function* () {
    yield { commentAdded: { text: 'First' } }
    yield { commentAdded: { text: 'Second' } }
  })
})

api.subscription('OnCommentAdded', ({ subscription }) => {
  subscription.error([{ message: 'Unprocessable entry' }])
})

api.subscription('OnCommentAdded', ({ subscription }) => {
  subscription.complete()
})
```

**Notes:**

- Only subscriptions over the WebSocket protocol are supported.
- The resolver argument also has `operationName`, `request` (the WebSocket handshake request), `params` and `finalize` (schedule cleanup when the subscription ends).
- `subscription.passthrough()` runs the subscription against the real server and lets you observe or rewrite its `next` events.

Reference: [MSW graphql API - subscription](https://mswjs.io/api/graphql#subscription-subscriptionname-resolver)
