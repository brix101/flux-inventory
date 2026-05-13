import { createFileRoute } from "@tanstack/react-router"

import { appConfig } from "~/lib/config"

export const Route = createFileRoute("/_app/inventory/products/$id")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: `${appConfig.name} - Inventory Products`,
      },
    ],
  }),
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Hello "/_app/inventory/products/{id}"!</div>
}
