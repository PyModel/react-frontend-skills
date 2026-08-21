---
name: typescript
description: Current TypeScript guidance, including TypeScript 7 migration, tsconfig design, type errors, declaration performance, async patterns, module organization, and runtime type safety. Use for .ts, .tsx, and .d.ts work; framework-specific patterns and testing are covered by their dedicated skills.
---

# TypeScript Best Practices

Comprehensive TypeScript 7-compatible guide with 44 rules across 8 categories, covering compiler configuration, type-system performance, async code, modules, safety, and measured runtime optimization.

## When to Apply

Reference these guidelines when:
- Configuring tsconfig.json for a new or existing project
- Writing complex type definitions or generics
- Optimizing async/await patterns and data fetching
- Organizing modules and managing imports
- Reviewing code for compilation or runtime performance

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Type System Performance | CRITICAL | `type-` |
| 2 | Compiler Configuration | CRITICAL | `tscfg-` |
| 3 | Async Patterns | HIGH | `async-` |
| 4 | Module Organization | HIGH | `module-` |
| 5 | Type Safety Patterns | MEDIUM-HIGH | `safety-` |
| 6 | Memory Management | MEDIUM | `mem-` |
| 7 | Runtime Optimization | LOW-MEDIUM | `runtime-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Table of Contents

1. Type System Performance — **CRITICAL**
   - 1.1 [Add Explicit Return Types to Exported Functions](references/type-explicit-return-types.md) — CRITICAL (faster declaration emit)
   - 1.2 [Avoid Deeply Nested Generic Types](references/type-avoid-deep-generics.md) — CRITICAL (prevents exponential instantiation cost)
   - 1.3 [Avoid Large Union Types](references/type-avoid-large-unions.md) — CRITICAL (quadratic O(n²) comparison cost)
   - 1.4 [Extract Conditional Types to Named Aliases](references/type-extract-conditional-types.md) — CRITICAL (enables compiler caching, prevents re-evaluation)
   - 1.5 [Limit Type Recursion Depth](references/type-limit-recursion-depth.md) — CRITICAL (prevents exponential type expansion)
   - 1.6 [Prefer Interfaces Over Type Intersections](references/type-interfaces-over-intersections.md) — CRITICAL (faster type resolution)
   - 1.7 [Simplify Complex Mapped Types](references/type-simplify-mapped-types.md) — CRITICAL (reduces type computation)
2. Compiler Configuration — **CRITICAL**
   - 2.1 [Configure Include and Exclude Properly](references/tscfg-exclude-properly.md) — CRITICAL (prevents scanning thousands of unnecessary files)
   - 2.2 [Enable Incremental Compilation](references/tscfg-enable-incremental.md) — CRITICAL (faster rebuilds)
   - 2.3 [Choose skipLibCheck Deliberately](references/tscfg-skip-lib-check.md) — CRITICAL (faster compilation)
   - 2.4 [Enable strictFunctionTypes for Sound Function Assignments](references/tscfg-strict-function-types.md) — CRITICAL (enables optimized variance checking)
   - 2.5 [Use isolatedModules for Single-File Transpilers](references/tscfg-isolate-modules.md) — CRITICAL (faster transpilation with bundlers)
   - 2.6 [Use Project References for Large Codebases](references/tscfg-project-references.md) — CRITICAL (faster incremental builds)
   - 2.7 [Migrate TypeScript 7 Configuration Deliberately](references/tscfg-typescript-7.md) — CRITICAL
3. Async Patterns — **HIGH**
   - 3.1 [Annotate Async Function Return Types](references/async-explicit-return-types.md) — HIGH (prevents runtime errors, improves inference)
   - 3.2 [Avoid await Inside Loops](references/async-avoid-loop-await.md) — HIGH (scales linearly with the number of iterations)
   - 3.3 [Avoid Unnecessary async/await](references/async-avoid-unnecessary-async.md) — HIGH (eliminates microtask queue overhead)
   - 3.4 [Defer await Until Value Is Needed](references/async-defer-await.md) — HIGH (enables implicit parallelization)
   - 3.5 [Use Promise.all for Independent Operations](references/async-parallel-promises.md) — HIGH (improvement in I/O-bound code)
4. Module Organization — **HIGH**
   - 4.1 [Avoid Barrel File Imports](references/module-avoid-barrel-imports.md) — HIGH (import cost, larger bundles)
   - 4.2 [Avoid Circular Dependencies](references/module-avoid-circular-dependencies.md) — HIGH (prevents runtime undefined errors and slow compilation)
   - 4.3 [Control @types Package Inclusion](references/module-control-types-inclusion.md) — HIGH (prevents type conflicts and reduces memory usage)
   - 4.4 [Use Dynamic Imports for Large Modules](references/module-dynamic-imports.md) — HIGH (reduces initial bundle)
   - 4.5 [Use Type-Only Imports for Types](references/module-use-type-imports.md) — HIGH (eliminates runtime imports for type information)
5. Type Safety Patterns — **MEDIUM-HIGH**
   - 5.1 [Enable strictNullChecks](references/safety-strict-null-checks.md) — MEDIUM-HIGH
   - 5.2 [Prefer unknown Over any](references/safety-prefer-unknown-over-any.md) — MEDIUM-HIGH
   - 5.3 [Use Assertion Functions for Validation](references/safety-assertion-functions.md) — MEDIUM-HIGH
   - 5.4 [Use const Assertions for Literal Types](references/safety-const-assertions.md) — MEDIUM-HIGH
   - 5.5 [Use Exhaustive Checks for Union Types](references/safety-exhaustive-checks.md) — MEDIUM-HIGH
   - 5.6 [Use Type Guards for Runtime Type Checking](references/safety-use-type-guards.md) — MEDIUM-HIGH
6. Memory Management — **MEDIUM**
   - 6.1 [Avoid Closure Memory Leaks](references/mem-avoid-closure-leaks.md) — MEDIUM (prevents retained references in long-lived callbacks)
   - 6.2 [Avoid Global State Accumulation](references/mem-avoid-global-state.md) — MEDIUM (prevents unbounded memory growth)
   - 6.3 [Clean Up Event Listeners](references/mem-cleanup-event-listeners.md) — MEDIUM (prevents unbounded memory growth)
   - 6.4 [Clear Timers and Intervals](references/mem-clear-timers.md) — MEDIUM (prevents callback retention and repeated execution)
   - 6.5 [Use WeakMap for Object Metadata](references/mem-use-weakmap-for-metadata.md) — MEDIUM (prevents memory leaks, enables automatic cleanup)
7. Runtime Optimization — **LOW-MEDIUM**
   - 7.1 [Avoid Object Spread in Hot Loops](references/runtime-avoid-object-spread-in-loops.md) — LOW-MEDIUM
   - 7.2 [Hoist Loop-Invariant Work in Measured Hot Paths](references/runtime-cache-property-access.md) — LOW-MEDIUM
   - 7.3 [Prefer Native Array Methods Over Lodash](references/runtime-prefer-array-methods.md) — LOW-MEDIUM
   - 7.4 [Use for-of for Simple Iteration](references/runtime-use-for-of-for-iteration.md) — LOW-MEDIUM
   - 7.5 [Use Modern String Methods](references/runtime-use-string-methods.md) — LOW-MEDIUM
   - 7.6 [Use Set/Map for O(1) Lookups](references/runtime-use-set-for-lookups.md) — LOW-MEDIUM
8. Advanced Patterns — **LOW**
   - 8.1 [Use Branded Types for Type-Safe IDs](references/advanced-branded-types.md) — LOW (prevents mixing incompatible ID types)
   - 8.2 [Use satisfies for Type Validation with Inference](references/advanced-satisfies-operator.md) — LOW (prevents property access errors, enables reliable autocomplete)
   - 8.3 [Use Template Literal Types for String Patterns](references/advanced-template-literal-types.md) — LOW (prevents string format errors at compile time)

## References

1. [https://github.com/microsoft/TypeScript/wiki/Performance](https://github.com/microsoft/TypeScript/wiki/Performance)
2. [https://www.typescriptlang.org/docs/handbook/](https://www.typescriptlang.org/docs/handbook/)
3. [https://v8.dev/blog](https://v8.dev/blog)
4. [https://nodejs.org/en/learn/diagnostics/memory](https://nodejs.org/en/learn/diagnostics/memory)
