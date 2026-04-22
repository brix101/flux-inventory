import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusCircleIcon } from "lucide-react"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { appConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import { productQueryOptions } from "@/server/product/product.functions"

export const Route = createFileRoute("/_app/inventory/products/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: `${appConfig.name} - Inventory Products`,
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productQueryOptions())
  },
})

function RouteComponent() {
  const postsQuery = useSuspenseQuery(productQueryOptions())

  console.log(postsQuery.data)
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>Products</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your inventory products here.
        </PageHeaderDescription>
      </PageHeader>
      <div className="flex w-full justify-between">
        <div>
          <Input />
        </div>
        <Link to="/inventory/products/new" className={cn(buttonVariants())}>
          <PlusCircleIcon />
        </Link>
      </div>
    </div>
  )
}
