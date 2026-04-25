import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/inventory/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/inventory/categories"!</div>
}
