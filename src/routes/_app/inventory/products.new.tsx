import { createFileRoute } from "@tanstack/react-router"

import { Card } from "@/components/ui/card"
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
  return (
    <div>
      {/* ADD header here */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2"></Card>
        <Card className="sr-only"></Card>
      </div>
    </div>
  )
}
