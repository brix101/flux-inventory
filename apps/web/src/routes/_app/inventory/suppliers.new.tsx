import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/inventory/suppliers/new")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/inventory/suppliers/new"!</div>
}
