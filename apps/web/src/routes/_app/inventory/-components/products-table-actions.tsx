import type { Table } from "@tanstack/react-table"
import React from "react"

import type { ProductType } from "./products-columns"

interface ProductsTableActionBarProps {
  table: Table<ProductType>
}

export function ProductsTableActionBar({ table }: ProductsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false)
      }
    },
    [table]
  )
  return <div></div>
}
