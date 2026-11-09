---
title: Pass Refs Through Composable Components
impact: CRITICAL
impactDescription: enables integration with form libraries and focus management
tags: arch, ref, refs, composition, forms
---

## Pass Refs Through Composable Components

Custom components wrapping shadcn/ui primitives must let a ref reach the underlying element to enable form library integration, focus management, and imperative handles. `ref` is a regular prop in React 19 — accept it and pass it through; no wrapper function is needed.

**Incorrect (ref not passed through):**

```tsx
interface SearchInputProps {
  onSearch: (query: string) => void
}

function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState("")

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
    />
  )
}

// Parent cannot focus the input
function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus() // null - ref never reaches <Input>
  }, [])

  return <SearchInput ref={inputRef} onSearch={handleSearch} />
}
```

**Correct (accept `ref` as a prop):**

```tsx
interface SearchInputProps {
  onSearch: (query: string) => void
  ref?: React.Ref<HTMLInputElement>
}

function SearchInput({ onSearch, ref }: SearchInputProps) {
  const [query, setQuery] = useState("")

  return (
    <Input
      ref={ref}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
    />
  )
}

// Parent can now focus the input
function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus() // Works - ref forwarded to Input
  }, [])

  return <SearchInput ref={inputRef} onSearch={handleSearch} />
}
```

**Always accept a ref prop when:**
- Wrapping form inputs (Input, Select, Textarea)
- Creating trigger components for modals/popovers
- Building components used with React Hook Form

Reference: [React 19 — ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
