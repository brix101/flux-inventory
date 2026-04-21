import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { productQueryOptions } from "@/functions/product/product.functions"
import { appConfig } from "@/lib/config"

export const Route = createFileRoute("/_app/inventory/products")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: `${appConfig.name} - Inventory Products`,
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productQueryOptions())
  },
})

function RouteComponent() {
  const postsQuery = useSuspenseQuery(productQueryOptions())

  console.log(postsQuery.data)
  return <div>Hello "/_app/inventory/products"!</div>
}
