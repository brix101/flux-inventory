import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/inventory/requests")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/inventory/requests"!</div>
}
