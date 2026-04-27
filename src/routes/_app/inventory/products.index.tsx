import { Suspense } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
import { appConfig } from "@/lib/config"
import {
  productQueryOptions,
  productQueryOptionsEffect,
} from "@/server/function/product/product.functions"
import { searchSchema } from "@/server/schema/search.schema"
import { productColumns } from "./-components/products-columns"
import { ProductsTableActionBar } from "./-components/products-table-actions"

export const Route = createFileRoute("/_app/inventory/products/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        label: `${appConfig.name} - Products`,
      },
    ],
  }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps }) => {
    context.queryClient.ensureQueryData(productQueryOptionsEffect(deps.search))
  },
})

function RouteComponent() {
  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderHeading>Products</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your inventory products here.
        </PageHeaderDescription>
      </PageHeader>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductList />
      </Suspense>
    </section>
  )
}

function ProductList() {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(productQueryOptionsEffect(search))

  const table = useDataTable({
    data: data.items,
    pageCount: data.pageCount,
    columns: productColumns,
  })

  return (
    <DataTable
      table={table}
      actionBar={<ProductsTableActionBar table={table} />}
    >
      <DataTableToolbar table={table}></DataTableToolbar>
    </DataTable>
  )
}
