import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createProductFn } from "@/server/function/product/product.functions"

export const Route = createFileRoute("/_app/inventory/products/new")({
  component: RouteComponent,
  // head: () => ({
  //   meta: [
  //     {
  //       label: `${appConfig.name} - New Product`,
  //     },
  //   ],
  // }),
})

function RouteComponent() {
  async function handleCreadTestProduct() {
    try {
      const response = await createProductFn({
        data: {
          name: "Test Product",
          categoryId: "1463528d-ef62-476b-8983-656ae87fa9ee",
          description: "This is a test product created for testing purposes.",
          unit: "pcs",
        },
      })
      console.log("Test product created:", response)
      toast.success("Product created successfully!")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.includes("already exists")
            ? "A product with this name already exists"
            : error.message
          : "Failed to create product"
      console.error(error)
      toast.error(message)
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
