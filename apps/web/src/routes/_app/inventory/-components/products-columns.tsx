import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "@tanstack/react-router"
import { Text } from "lucide-react"

import type { getProductsFn } from "@/server/function/product/product.functions"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      const product = row.original.product

      let productName = product.name
      if (name !== "Standard") {
        productName += ` (${name})`
      }

      return (
        <Link
          to="/inventory/products/$id"
          params={{ id: row.original.id }}
          className={cn(buttonVariants({ variant: "link" }), "p-0 capitalize")}
        >
          {productName}
        </Link>
      )
    },
    meta: {
      label: "Name",
      placeholder: "Search products...",
      variant: "text",
      icon: <Text />,
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
    cell: ({ row }) => {
      const sku = row.getValue<ProductType["sku"]>("sku")

      return <p>{sku}</p>
    },
  },
  {
    accessorKey: "product.category.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.original.product.category
      if (!category) {
        return <Badge className="uppercase">Uncategorized</Badge>
      }

      return <Badge className="uppercase">{category.name}</Badge>
    },
  },
]
