import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/inventory/suppliers")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_app/inventory/suppliers"!</div>;
}
