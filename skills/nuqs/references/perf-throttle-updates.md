---
title: Throttle Rapid URL Updates
impact: MEDIUM
impactDescription: respects browser History API limits and bounds server updates
tags: perf, limitUrlUpdates, throttle, rate-limiting, slider
---

## Throttle Rapid URL Updates

nuqs already applies a browser-adapted default throttle to URL writes. Increase it only when high-frequency state changes should update the URL or a `shallow: false` server route less often. Since nuqs 2.5, use `limitUrlUpdates: throttle(ms)`; `throttleMs` is deprecated.

**Incorrect (deprecated option):**

```tsx
useQueryState(
  'volume',
  parseAsInteger.withDefault(50).withOptions({ throttleMs: 100 })
)
```

When the default browser-adapted limit is sufficient, no custom option is needed:

```tsx
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
```

**Correct (current rate-limit API):**

```tsx
'use client'

import { parseAsInteger, throttle, useQueryState } from 'nuqs'

export default function VolumeSlider() {
  const [volume, setVolume] = useQueryState(
    'volume',
    parseAsInteger.withDefault(50).withOptions({
      limitUrlUpdates: throttle(100),
    })
  )

  return (
    <input
      type="range"
      min={0}
      max={100}
      value={volume}
      onChange={(event) => setVolume(Number(event.target.value))}
    />
  )
}
```

The hook state updates immediately; only the URL write and any `shallow: false` server request are rate-limited.

Use a call-level override when one update must bypass the configured throttle:

```tsx
import { defaultRateLimit } from 'nuqs'

await setVolume(50, { limitUrlUpdates: defaultRateLimit })
```

Use `debounce()` rather than `throttle()` when only the final high-frequency value matters. Values below nuqs/browser minimums may be ignored, so do not use a zero-duration throttle as an "immediate" escape hatch.

Reference: [nuqs rate-limiting options](https://nuqs.dev/docs/options#rate-limiting-url-updates)
