---
title: Register Value Classes in OpaqueTypes
impact: LOW
impactDescription: stops Path and DeepPartial from walking into Dayjs, Decimal or Money objects, removing bogus field paths and "Excessive complexity" type errors
tags: adv, typescript, OpaqueTypes, path, performance
---

## Register Value Classes in OpaqueTypes

React Hook Form's path types (`Path`, `DeepPartial`, `FieldErrorsImpl` …) recurse into every object in your form values. A `Dayjs`, `Decimal` or custom `Money` field then produces paths such as `price.cents`, and large classes can trigger TypeScript "Excessive complexity" errors. Since 7.87, you can declare such types opaque once, so the form treats them as leaf values.

**Incorrect (the class is walked like a nested form object):**

```typescript
class Money {
  constructor(readonly cents: number, readonly currency: string) {}
}

type PriceForm = { title: string; price: Money }

// Compiles, but 'price.cents' is not a real field: the value is replaced as a whole
register('price.cents')
```

**Correct (declare it opaque once, e.g. in a shared types file):**

```typescript
import type { Path } from 'react-hook-form'

class Money {
  constructor(readonly cents: number, readonly currency: string) {}
}

declare module 'react-hook-form' {
  interface OpaqueTypes {
    money: Money
  }
}

type PriceForm = { title: string; price: Money }

const ok: Path<PriceForm> = 'price'
// @ts-expect-error: 'price.cents' is no longer a form path
const bad: Path<PriceForm> = 'price.cents'
```

With an empty registry nothing changes, so adding it is safe.

**When NOT to use this pattern:**
- Plain nested objects whose fields are separate inputs (`address.street`): they must stay walkable

Reference: [v7.87.0 release](https://github.com/react-hook-form/react-hook-form/releases/tag/v7.87.0) · [TypeScript support](https://react-hook-form.com/ts)
