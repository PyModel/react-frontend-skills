---
title: Mock WebSocket Connections with ws.link
impact: MEDIUM
impactDescription: tests realtime features (chat, live feeds) without a real server
tags: msw, websocket, ws, realtime, socket.io
---

## Mock WebSocket Connections with ws.link

MSW 2.x intercepts WebSocket connections with the `ws` namespace. `ws.link(url)` creates a WebSocket link handler; its `connection` event gives you the `client` and `server` connection objects to mock a realtime session.

**Incorrect (mocking WebSocket with ad-hoc stubs):**

```typescript
// Replacing the global WebSocket with a hand-rolled fake
class FakeWebSocket {
  send = vi.fn()
  close = vi.fn()
  addEventListener = vi.fn()
}
vi.stubGlobal('WebSocket', FakeWebSocket)
// Breaks on every real-world protocol nuance; skips MSW's
// handler model entirely, so no shared mock scenarios
```

**Correct (use a WebSocket link handler):**

```typescript
import { ws } from 'msw'

const chat = ws.link('wss://api.example.com/chat')

export const handlers = [
  chat.addEventListener('connection', ({ client, server }) => {
    // Greet the connected client immediately
    client.send(JSON.stringify({ type: 'welcome' }))

    // Echo incoming client messages back
    client.addEventListener('message', (event) => {
      client.send(JSON.stringify({ type: 'ack', data: event.data }))
    })
  }),
]
```

**Forward between client and actual server:**

```typescript
chat.addEventListener('connection', ({ client, server }) => {
  server.connect()

  // Pass client messages through to the real server
  client.addEventListener('message', (event) => {
    server.send(event.data)
  })

  // Observe server messages without changing them
  server.addEventListener('message', (event) => {
    client.send(event.data)
  })
})
```

**Mock Socket.IO with the official binding:**

```typescript
import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

const chat = ws.link('wss://chat.example.com')

export const handlers = [
  chat.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)

    io.client.on('hello', (username) => {
      io.client.emit('message', `hello, ${username}!`)
    })
  }),
]
```

**Notes:**

- The connection listener arguments include `client`, `server`, `params` (path parameters from the link URL), and connection `info`.
- Call `server.connect()` only when you want to establish the actual underlying server connection; omit it for fully mocked sessions.
- WebSocket links go in the same `handlers` array as `http`/`graphql` handlers and work in browser, Node.js, and React Native integrations.
