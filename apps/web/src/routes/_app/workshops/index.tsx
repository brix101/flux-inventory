import { createFileRoute } from "@tanstack/react-router"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header"

export const Route = createFileRoute("/_app/workshops/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>Workshops</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your workshops here.
        </PageHeaderDescription>
      </PageHeader>
    </div>
  )
}
