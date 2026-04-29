import { useForm } from "@tanstack/react-form"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import * as Schema from "effect/Schema"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { appConfig } from "@/lib/config"
import { CreateProductSchema } from "@/server/function/product/product.domain"
import { createProductFn } from "@/server/function/product/product.functions"

export const Route = createFileRoute("/_app/inventory/products/new")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: `${appConfig.name} - New Product` }],
  }),
})

function RouteComponent() {
  const serverFn = useServerFn(createProductFn)

  const form = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      unit: "pcs",
    },
    validators: {
      // @ts-expect-error - Need to convert schema to match form validator shape
      onChange: Schema.toStandardSchemaV1(CreateProductSchema),
    },
    onSubmit: async ({ value }) => serverFn({ data: value }),
  })

  const testCategories = [
    { id: "1463528d-ef62-476b-8983-656ae87fa9ee", name: "Electronics" },
    { id: "2c9f4e21-9ac3-4d7b-a5e1-8c3d9f0ab123", name: "Furniture" },
    { id: "3d8a5f32-bc24-4e8c-b6d2-9e4f0a1cd234", name: "Office Supplies" },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Product</h1>
        <Link
          to="/inventory/products"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Back to Products
        </Link>
      </div>
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Product Name</FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="Enter product name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <FieldDescription>
                      Must be at least 3 characters
                    </FieldDescription>
                  </Field>
                )
              }}
            />
            <form.Field
              name="categoryId"
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value || "")}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {testCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }}
            />
            <form.Field
              name="unit"
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Unit</FieldLabel>
                    <Select
                      value={field.state.value || "pcs"}
                      onValueChange={(value) =>
                        field.handleChange(value || "pcs")
                      }
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="m">Meters (m)</SelectItem>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="L">Liters (L)</SelectItem>
                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }}
            />
            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="Enter product description"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <FieldDescription>
                      Optional, max 500 characters
                    </FieldDescription>
                  </Field>
                )
              }}
            />
            <Field>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <div className="flex gap-4">
                    <Button type="submit" disabled={!canSubmit}>
                      {isSubmitting ? <Spinner /> : "Create Product"}
                    </Button>
                    <Link
                      to="/inventory/products"
                      className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </Link>
                  </div>
                )}
              </form.Subscribe>
            </Field>
          </FieldGroup>
        </form>
      </Card>
    </div>
  )
}
