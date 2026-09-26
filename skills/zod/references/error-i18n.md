---
title: Implement Internationalized Error Messages
impact: HIGH
impactDescription: Hardcoded English messages exclude non-English users; error maps enable localized messages for global applications
tags: error, i18n, localization, internationalization
---

## Implement Internationalized Error Messages

Hardcoded error messages in English exclude users who speak other languages. Zod 4 ships built-in locales, and lets you provide app-specific localized messages through a custom error map, making your application accessible globally.

**Incorrect (hardcoded English messages):**

```typescript
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  age: z.number().min(18, 'You must be at least 18 years old'),
})

// French users see English errors - poor UX
```

**Built-in locales (the simplest option):**

```typescript
import * as z from 'zod'

// Configure Zod's bundled locale globally at startup
z.config(z.locales.fr())

// All default messages are now French
```

**Correct (app-specific localized messages via a custom error map):**

```typescript
import * as z from 'zod'

// Translation dictionaries
const translations = {
  en: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    tooShort: (min: number) => `Must be at least ${min} characters`,
    tooYoung: (min: number) => `You must be at least ${min} years old`,
  },
  fr: {
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Veuillez entrer une adresse email valide',
    tooShort: (min: number) => `Doit contenir au moins ${min} caractères`,
    tooYoung: (min: number) => `Vous devez avoir au moins ${min} ans`,
  },
  es: {
    required: 'Este campo es requerido',
    invalidEmail: 'Por favor ingrese un correo electrónico válido',
    tooShort: (min: number) => `Debe tener al menos ${min} caracteres`,
    tooYoung: (min: number) => `Debes tener al menos ${min} años`,
  },
} as const

type Locale = keyof typeof translations

// Zod 4: an error map returns a string, or undefined to defer.
// Switch on the string `issue.code` (e.g. 'invalid_type', 'too_small').
function createErrorMap(locale: Locale) {
  const t = translations[locale]

  return (issue: z.core.$ZodRawIssue): string | undefined => {
    if (issue.code === 'invalid_type' && issue.input === undefined) {
      return t.required
    }
    if (issue.code === 'invalid_format' && issue.format === 'email') {
      return t.invalidEmail
    }
    if (issue.code === 'too_small') {
      return issue.origin === 'number'
        ? t.tooYoung(issue.minimum as number)
        : t.tooShort(issue.minimum as number)
    }
    return undefined
  }
}

const userSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  age: z.number().min(18),
})

const result = userSchema.safeParse(
  { name: '', email: 'bad', age: 15 },
  { error: createErrorMap('fr') }
)

// French error messages:
// - "Ce champ est obligatoire"
// - "Veuillez entrer une adresse email valide"
// - "Vous devez avoir au moins 18 ans"
```

**Setting the error map globally:**

```typescript
// At application startup (v3's z.setErrorMap was removed)
const userLocale = getUserLocale()  // From cookie, header, etc.
z.config({ customError: createErrorMap(userLocale) })

// All schemas now use localized messages
```

Since Zod 4.6, `safeParse` builds issue messages lazily, when `error` is first read. Set the locale or `customError` before parsing, and don't change `z.config` between `safeParse()` and reading `result.error`: the message comes out in whichever locale is active at read time. For the same reason, an error map must be a pure function; don't count or log inside it.

**With i18n libraries (react-intl, i18next):**

```typescript
import * as z from 'zod'
import { useIntl } from 'react-intl'

function useZodErrorMap() {
  const intl = useIntl()

  return (issue: z.core.$ZodRawIssue): string | undefined => {
    if (issue.code === 'too_small') {
      return intl.formatMessage(
        { id: 'validation.tooShort' },
        { min: issue.minimum }
      )
    }
    return undefined
  }
}
```

**When NOT to use this pattern:**
- Internal tools used only by your team
- Single-language applications

Reference: [Zod Error Customization - Internationalization](https://zod.dev/error-customization#internationalization)
