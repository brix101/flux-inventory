import { createFileRoute } from "@tanstack/react-router"

import { appConfig } from "@/lib/config"

export const Route = createFileRoute("/_app/inventory/products/new")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        label: `${appConfig.name} - New Product`,
      },
    ],
  }),
})

function RouteComponent() {
  return <div>Hello "/_app/inventory/products"!</div>
}
