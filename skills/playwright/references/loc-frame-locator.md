---
title: Locate Elements Inside iframes with frameLocator
impact: HIGH
impactDescription: page locators do not pierce iframes; payment, captcha and embed widgets need a frame locator
tags: locators, iframe, frameLocator, third-party, embeds
---

## Locate Elements Inside iframes with frameLocator

Locators from `page.getByRole()` and friends only search the main document. Content inside an `<iframe>`, such as a payment form, captcha, video embed or chat widget, needs a frame locator. It auto-waits for the frame and its content just like a normal locator.

**Incorrect (searching the main page, or reaching into frames by index):**

```typescript
// Times out: the card field lives inside the payment iframe
await page.getByLabel('Card number').fill('4242 4242 4242 4242');

// Brittle: depends on frame order and doesn't auto-wait for the frame
await page.frames()[1].fill('input[name="cardnumber"]', '4242 4242 4242 4242');
```

**Correct (select the frame, then use normal locators):**

```typescript
const payment = page.frameLocator('iframe[title="Secure payment input frame"]');

await payment.getByLabel('Card number').fill('4242 4242 4242 4242');
await payment.getByLabel('Expiration date').fill('12 / 34');
```

**Without a frame selector (Playwright 1.63+):**

`page.frameLocator()` with no argument searches every frame on the page. It suits a page with one embed whose content is unique. It throws if the target matches in more than one frame, so add a selector as soon as a second iframe could contain it.

```typescript
await page.frameLocator().getByRole('button', { name: 'Play video' }).click();
```

`locator.frameLocator()` and nested `frameLocator().frameLocator()` calls still require a selector.

**When NOT to use this pattern:**
- The content is same-document markup that merely looks embedded, such as a modal or shadow DOM. Normal locators already pierce open shadow roots.
- Third-party frames you don't control in E2E tests: consider mocking the provider (see `mock-` rules) instead of driving their UI

Reference: [Playwright FrameLocator](https://playwright.dev/docs/api/class-framelocator) · [Playwright 1.63 release](https://github.com/microsoft/playwright/releases/tag/v1.63.0)
