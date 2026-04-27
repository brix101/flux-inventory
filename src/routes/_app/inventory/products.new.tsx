import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { appConfig } from "@/lib/config"
import { createProductFn } from "@/server/function/product/product.functions"

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
  async function handleCreadTestProduct() {
    try {
      const response = await createProductFn({
        data: {
          name: "Test Product",
          categoryId: "1463528d-ef62-476b-8983-656ae87fa9ee",
        },
      })
      console.log("Test product created:", response)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }

  return (
    <div>
      {/* ADD header here */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <Button onClick={handleCreadTestProduct}>Create test product</Button>
        </Card>
        <Card className="sr-only"></Card>
      </div>
    </div>
  )
}
