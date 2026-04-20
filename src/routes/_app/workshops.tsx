import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/workshops")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/workshops"!</div>
}
