---
title: Keep Unit Tests Fast Enough for Continuous Feedback
impact: MEDIUM
impactDescription: preserves a short red-green-refactor loop without arbitrary per-test budgets
tags: perf, speed, unit-tests, fast-feedback
---

## Keep Unit Tests Fast Enough for Continuous Feedback

Unit tests should be deterministic and fast enough that developers run the relevant set continuously. There is no universal 100 ms per-test threshold: initialization, language runtime, hardware, and suite architecture differ. Measure the suite and protect a project-specific feedback budget.

**Incorrect (turning a unit test into an uncontrolled integration test):**

```typescript
test('loads a user', async () => {
  const response = await fetch('https://production.example.com/users/1')
  expect(await response.json()).toMatchObject({ id: 1 })
})
```

**Correct (exercise deterministic in-memory behavior):**

Keep network, database, filesystem, clock, and process boundaries out of a unit test unless that boundary is the subject under test:

```typescript
test('rejects an invalid email', () => {
  const result = validateUserData(
    createUser({ email: 'invalid' })
  )

  expect(result.errors).toContain('Invalid email format')
})
```

Test real boundary behavior in integration tests with controlled infrastructure rather than replacing every collaborator with interaction-heavy mocks.

Useful practices:

- Run the smallest relevant tests during red-green-refactor.
- Use deterministic in-memory fakes for external boundaries when behavior permits.
- Share immutable expensive setup only when isolation remains intact.
- Profile slow files and setup hooks before optimizing individual assertions.
- Track suite duration over time in CI when feedback latency matters.
- Keep integration and E2E coverage for contracts unit tests cannot prove.

Choose budgets from the repository's baseline and team workflow, then treat meaningful regressions as failures or review signals.

Reference: [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
