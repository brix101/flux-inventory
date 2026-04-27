import type { ColumnDef } from "@tanstack/react-table"
import { Text } from "lucide-react"

import type { getProductsFn } from "@/server/function/product/product.functions"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export type ProductType = Awaited<
  ReturnType<typeof getProductsFn>
>["items"][number]

export const productColumns: ColumnDef<ProductType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue<ProductType["name"]>("name")

      return <div className="text-right font-medium">{name}</div>
    },
    meta: {
      label: "Name",
      placeholder: "Search products...",
      variant: "text",
      icon: <Text />,
    },
    enableColumnFilter: true,
  },
]
