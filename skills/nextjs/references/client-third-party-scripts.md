---
title: Load Third-Party Scripts Efficiently
impact: LOW-MEDIUM
impactDescription: prevents blocking, improves LCP
tags: client, scripts, third-party, performance
---

## Load Third-Party Scripts Efficiently

Use `next/script` for third-party scripts with appropriate loading strategies. Avoid blocking the main thread with synchronous scripts.

**Incorrect (blocking script in head):**

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script src="https://analytics.example.com/script.js" />
        {/* Blocks rendering until script loads */}
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Correct (next/script with strategy):**

```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* Analytics - load after page is interactive */}
        <Script
          src="https://analytics.example.com/script.js"
          strategy="afterInteractive"
        />

        {/* Chat widget - load when idle */}
        <Script
          src="https://chat.example.com/widget.js"
          strategy="lazyOnload"
        />

        {/* Rare critical bootstrap that must run before hydration */}
        <Script id="consent-bootstrap" strategy="beforeInteractive">
          {`window.consentConfig = { region: 'auto' };`}
        </Script>
      </body>
    </html>
  )
}
```

**Strategy guide:**
- `beforeInteractive` - Critical scripts (rare)
- `afterInteractive` - Analytics, tracking (default)
- `lazyOnload` - Chat widgets, social buttons
- `worker` - Experimental and version/router constrained; verify support in the installed Next.js docs
