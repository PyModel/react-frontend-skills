---
title: Configure TypeScript for MSW
impact: CRITICAL
impactDescription: TypeScript 5.9+ required; incorrect config causes type errors
tags: setup, typescript, configuration, types, compiler
---

## Configure TypeScript for MSW

MSW requires TypeScript 5.9+ (optional peer dependency `typescript: >=5.9.x`) for proper type inference. Its subpath entrypoints (`msw/http`, `msw/graphql`, …) resolve only through package `exports`, so `moduleResolution` must be `bundler` (with `module: "ESNext"` or `"preserve"`), or `node16`/`nodenext` with the matching `module` value (`node16` with `node16`, `nodenext` with `nodenext`).

**Incorrect (missing or incompatible config):**

```json
// tsconfig.json - missing moduleResolution
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext"
    // No moduleResolution - imports fail to resolve
  }
}
```

```typescript
// Type errors due to incorrect resolution
import { http, HttpResponse } from 'msw/http'
// Error: Cannot find module 'msw/http' or its corresponding type declarations
```

**Correct (proper TypeScript configuration):**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler", // or "node16" / "nodenext"
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

**Typed handlers with proper inference:**

```typescript
import { http, HttpResponse } from 'msw/http'

interface User {
  id: string
  name: string
  email: string
}

export const handlers = [
  http.get<{ id: string }, never, User>('/api/user/:id', ({ params }) => {
    // params.id is typed as string
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
    })
  }),
]
```

**When NOT to use this pattern:**
- JavaScript-only projects don't need TypeScript configuration
- `moduleResolution: "node"` (node10) ignores `exports` and cannot resolve the subpaths

Reference: [MSW Getting started](https://mswjs.io/docs/quick-start)
