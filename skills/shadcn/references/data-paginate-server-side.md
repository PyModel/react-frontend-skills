---
title: Paginate Large Datasets Server-Side
impact: MEDIUM-HIGH
impactDescription: reduces initial payload for large datasets
tags: data, pagination, server-side, api, performance
---

## Paginate Large Datasets Server-Side

Use server-side pagination when loading and rendering the full dataset would exceed the product's payload, latency, memory, or freshness budget. Small bounded datasets can remain client-side; do not use an arbitrary item-count threshold.

**Incorrect (client-side pagination):**

```tsx
function ProductTable() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then((response) => response.json()),
  })
  // Fetches the full collection on mount.

  const [page, setPage] = useState(0)
  const pageSize = 10
  const paginatedProducts = products?.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <>
      <Table>{/* render paginatedProducts */}</Table>
      <Pagination>{/* ... */}</Pagination>
    </>
  )
}
```

**Correct (server-side pagination):**

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'

function ProductTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data } = useQuery({
    queryKey: ['products', pagination],
    queryFn: async () => {
      const response = await fetch(
        `/api/products?page=${pagination.pageIndex}&limit=${pagination.pageSize}`
      )
      if (!response.ok) throw new Error('Failed to load products')
      return response.json()
    },
    placeholderData: keepPreviousData,
  })

  const table = useReactTable({
    data: data?.products ?? [],
    columns,
    pageCount: data?.totalPages ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true, // Tell TanStack Table pagination is server-side
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <Table>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} of {data?.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}
```

Reference: [TanStack Table pagination](https://tanstack.com/table/v8/docs/guide/pagination)
