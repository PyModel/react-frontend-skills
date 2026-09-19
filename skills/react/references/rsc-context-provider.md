---
title: Render Context Providers in Server Components
impact: LOW-MEDIUM
impactDescription: removes provider-wrapper components from the client tree
tags: react, rsc, context, server-components
---

## Render Context Providers in Server Components

New in React 19.3: a Server Component can render a Context provider (created in a `'use client'` module) directly, passing a serializable value to client consumers. This removes the hand-written "Providers" client wrapper component that existed only because Server Components could not render providers.

**Incorrect (client wrapper just to hold a provider):**

```tsx
// providers.tsx — 'use client' component whose only job
// is hosting the provider
'use client'
import { ThemeContext } from './theme-context'

export function Providers({ theme, children }) {
  return <ThemeContext value={theme}>{children}</ThemeContext>
}

// app/layout.tsx
import { Providers } from './providers'

export default async function Layout({ children }) {
  const theme = await getTheme()
  return <Providers theme={theme}>{children}</Providers>
}
```

**Correct (render the provider directly in the Server Component):**

```tsx
// app/layout.tsx (Server Component)
import { ThemeContext } from './theme-context' // 'use client' module

export default async function Layout({ children }) {
  const theme = await getTheme()
  return <ThemeContext value={theme}>{children}</ThemeContext>
}
```

**Notes:**

- The provider component itself must come from a `'use client'` module; the value passed must be serializable.
- Server Components still cannot *read* context (`useContext` stays client-side) — this change is about rendering the provider, not consuming it.
- Children passed through the provider are still rendered on the server as usual.
- `createContext`-based modules that previously needed a `'use client'` wrapper keep their directive; only the wrapper component disappears.
