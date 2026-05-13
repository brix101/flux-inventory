import { createFileRoute } from "@tanstack/react-router"
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "~/components/page-header"



export const Route = createFileRoute("/_app/inventory/purchase-orders")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>Purchase Orders</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your inventory purchase orders here.
        </PageHeaderDescription>
      </PageHeader>
    </div>
  )
}
