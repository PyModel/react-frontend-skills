# Playwright + Next.js

**Version 0.1.0**  
Community  
August 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive testing best practices guide for Playwright with Next.js applications, designed for AI agents and LLMs. Contains 43 rules across 8 categories, prioritized by impact from critical (test architecture, stable selectors) to incremental (debugging, CI integration). Each rule includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific impact metrics to guide reliable, fast, and maintainable E2E test development.

---

## Table of Contents

1. [Test Architecture](references/_sections.md#1-test-architecture) — **CRITICAL**
   - 1.1 [Clean Up Test State After Each Test](references/arch-cleanup-state.md) — CRITICAL (prevents cascading failures from leftover data)
   - 1.2 [Enable Parallel Test Execution](references/arch-parallel-execution.md) — CRITICAL (faster test suites)
   - 1.3 [Test Against Production Builds](references/arch-test-production.md) — CRITICAL (catches build-only bugs, matches real behavior)
   - 1.4 [Use Fixtures for Shared Setup](references/arch-fixtures.md) — CRITICAL (eliminates setup duplication across tests)
   - 1.5 [Use Fresh Browser Context for Each Test](references/arch-test-isolation.md) — CRITICAL (eliminates cross-test state pollution)
   - 1.6 [Use Page Object Model for Complex Pages](references/arch-page-object-model.md) — CRITICAL (reduces selector maintenance)
2. [Selectors & Locators](references/_sections.md#2-selectors-&-locators) — **CRITICAL**
   - 2.1 [Avoid XPath Selectors](references/loc-avoid-xpath.md) — HIGH (XPath is slower and more brittle)
   - 2.2 [Chain Locators for Specificity](references/loc-chained-locators.md) — HIGH (reduces ambiguity without brittle selectors)
   - 2.3 [Use data-testid for Dynamic Elements](references/loc-data-testid.md) — CRITICAL (stable selectors for dynamic content)
   - 2.4 [Use getByLabel for Form Inputs](references/loc-label-selectors.md) — CRITICAL (matches user behavior, encourages accessible forms)
   - 2.5 [Use getByPlaceholder Sparingly](references/loc-placeholder-selector.md) — MEDIUM (fallback when labels unavailable)
   - 2.6 [Use getByText for Static Content](references/loc-text-selectors.md) — HIGH (matches user perception of the page)
   - 2.7 [Use Role-Based Selectors Over CSS](references/loc-role-selectors.md) — CRITICAL (large reduction in selector-related flakiness)
3. [Waiting & Assertions](references/_sections.md#3-waiting-&-assertions) — **HIGH**
   - 3.1 [Avoid Hard Waits](references/wait-avoid-hard-waits.md) — HIGH (hard waits waste time or cause flakiness)
   - 3.2 [Configure Timeouts Appropriately](references/wait-custom-timeout.md) — MEDIUM (balance between flakiness and fast feedback)
   - 3.3 [Let Actions Auto-Wait Before Interacting](references/wait-action-retries.md) — HIGH (Playwright auto-waits for actionability)
   - 3.4 [Wait for Observable Readiness, Not Network Idle](references/wait-network-idle.md) — HIGH (waits for all resources to load)
   - 3.5 [Use Soft Assertions for Non-Critical Checks](references/wait-soft-assertions.md) — MEDIUM (collect multiple failures without stopping test)
   - 3.6 [Use Web-First Assertions](references/wait-web-first-assertions.md) — HIGH (auto-retry eliminates timing failures)
4. [Authentication & State](references/_sections.md#4-authentication-&-state) — **HIGH**
   - 4.1 [Handle Session Storage for Auth](references/auth-session-storage.md) — HIGH (preserves auth state that uses sessionStorage)
   - 4.2 [Reuse Authentication with Storage State](references/auth-storage-state.md) — HIGH (large reduction in test execution time)
   - 4.3 [Use API Login for Faster Auth Setup](references/auth-api-login.md) — HIGH (faster than UI login)
   - 4.4 [Use Separate Storage States for Different Roles](references/auth-multiple-roles.md) — HIGH (test role-specific features efficiently)
   - 4.5 [Use Worker-Scoped Auth for Parallel Tests](references/auth-parallel-workers.md) — MEDIUM-HIGH
5. [Mocking & Network](references/_sections.md#5-mocking-&-network) — **MEDIUM-HIGH**
   - 5.1 [Abort Unnecessary Requests](references/mock-abort-requests.md) — MEDIUM (faster page loads in tests)
   - 5.2 [Intercept and Modify Real Responses](references/mock-intercept-modify.md) — MEDIUM-HIGH
   - 5.3 [Mock API Responses for Deterministic Tests](references/mock-api-responses.md) — MEDIUM-HIGH
   - 5.4 [Simulate Network Conditions](references/mock-network-conditions.md) — MEDIUM (validates offline and slow network behavior)
   - 5.5 [Use HAR Files for Complex Mock Scenarios](references/mock-har-files.md) — MEDIUM (realistic multi-request mocking)
6. [Next.js Integration](references/_sections.md#6-next.js-integration) — **MEDIUM**
   - 6.1 [Configure baseURL for Clean Navigation](references/next-baseurl-config.md) — MEDIUM (cleaner test code, easier environment switching)
   - 6.2 [Test App Router Navigation Patterns](references/next-app-router-navigation.md) — MEDIUM (validates soft navigation preserves state)
   - 6.3 [Test Server Actions End-to-End](references/next-server-actions.md) — MEDIUM (validates complete form-to-server flow)
   - 6.4 [Test Server Components Correctly](references/next-server-components.md) — MEDIUM (validates RSC behavior end-to-end)
   - 6.5 [Wait for Hydration Before Interacting](references/next-wait-hydration.md) — MEDIUM (prevents hydration mismatch errors)
7. [Performance & Speed](references/_sections.md#7-performance-&-speed) — **MEDIUM**
   - 7.1 [Use Retries to Detect and Diagnose Flakiness](references/perf-retries.md) — MEDIUM (reduces false negatives from intermittent failures)
   - 7.2 [Reuse a Matching Local Server When Safe](references/perf-reuse-server.md) — MEDIUM (eliminates 30-60s server startup per test run)
   - 7.3 [Select Browsers Strategically](references/perf-browser-selection.md) — MEDIUM (balance coverage vs execution time)
   - 7.4 [Use Headless Mode in CI](references/perf-headless-ci.md) — MEDIUM (faster execution, less resource usage)
   - 7.5 [Use Sharding for Large Test Suites](references/perf-sharding.md) — MEDIUM (faster CI with distributed execution)
8. [Debugging & CI](references/_sections.md#8-debugging-&-ci) — **LOW-MEDIUM**
   - 8.1 [Capture Screenshots and Videos on Failure](references/debug-screenshots-videos.md) — LOW-MEDIUM
   - 8.2 [Configure Reporters for CI Integration](references/debug-ci-reporters.md) — LOW-MEDIUM
   - 8.3 [Use Playwright Inspector for Interactive Debugging](references/debug-inspector.md) — LOW-MEDIUM
   - 8.4 [Use Trace Viewer for Failed Tests](references/debug-trace-viewer.md) — LOW-MEDIUM

---

## References

1. [https://playwright.dev](https://playwright.dev)
2. [https://playwright.dev/docs/best-practices](https://playwright.dev/docs/best-practices)
3. [https://nextjs.org/docs/pages/guides/testing/playwright](https://nextjs.org/docs/pages/guides/testing/playwright)
4. [https://www.browserstack.com/guide/playwright-best-practices](https://www.browserstack.com/guide/playwright-best-practices)
5. [https://betterstack.com/community/guides/testing/avoid-flaky-playwright-tests/](https://betterstack.com/community/guides/testing/avoid-flaky-playwright-tests/)

---

## Source Files

This document was compiled from individual reference files. For detailed editing or extension:

| File | Description |
|------|-------------|
| [references/_sections.md](references/_sections.md) | Category definitions and impact ordering |
| [SKILL.md](SKILL.md) | Quick reference entry point |
| [metadata.json](metadata.json) | Version and reference URLs |
