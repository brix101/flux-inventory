import { createFileRoute } from "@tanstack/react-router"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

export const Route = createFileRoute("/_app/inventory/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>Inventory</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your inventory here.
        </PageHeaderDescription>
      </PageHeader>
    </div>
  )
}
