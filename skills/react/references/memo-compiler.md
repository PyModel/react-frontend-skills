---
title: Leverage React Compiler for Automatic Memoization
impact: MEDIUM
impactDescription: automatic optimization, less manual code
tags: memo, compiler, automatic, optimization
---

## Leverage React Compiler for Automatic Memoization

React Compiler 1.0 is stable and can automatically memoize eligible components and values. It is separate tooling and is not enabled merely by installing React 19. Reduce manual `useMemo`/`useCallback` only after the project enables the compiler and passes its diagnostics.

**Incorrect (verbose manual memoization):**

```typescript
function ProductPage({ product }: { product: Product }) {
  const formattedPrice = useMemo(() =>
    formatCurrency(product.price),
    [product.price]
  )

  const handleAddToCart = useCallback(() => {
    addToCart(product.id)
  }, [product.id])

  const relatedProducts = useMemo(() =>
    products.filter(p => p.category === product.category),
    [products, product.category]
  )

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{formattedPrice}</p>
      <AddButton onClick={handleAddToCart} />
      <RelatedList products={relatedProducts} />
    </div>
  )
}
// Lots of manual memoization boilerplate
```

**Correct (React Compiler handles memoization):**

```typescript
function ProductPage({ product }: { product: Product }) {
  // Compiler automatically memoizes these
  const formattedPrice = formatCurrency(product.price)

  function handleAddToCart() {
    addToCart(product.id)
  }

  const relatedProducts = products.filter(
    p => p.category === product.category
  )

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{formattedPrice}</p>
      <AddButton onClick={handleAddToCart} />
      <RelatedList products={relatedProducts} />
    </div>
  )
}
// Cleaner code, compiler handles memoization
```

**Enabling React Compiler with Babel:**

```bash
npm install --save-dev babel-plugin-react-compiler
```

```javascript
// babel.config.js
module.exports = {
  plugins: ['babel-plugin-react-compiler'],
}
```

Framework integrations may provide a version-specific configuration path; follow the installed framework's official guide instead of adding a second Babel pipeline.

**Note:** Still use manual memoization for edge cases the compiler can't optimize, and measure with React Profiler.
