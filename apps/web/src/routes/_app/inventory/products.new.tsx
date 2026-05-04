import React from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import * as Schema from "effect/Schema"
import { CloudUploadIcon, Package, XIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { appConfig } from "@/lib/config"
import { categoriesQueryOptions } from "@/server/function/category/category.functions"
import { CreateProductSchema } from "@/server/function/product/product.domain"
import { createProductFn } from "@/server/function/product/product.functions"
import { unitsQueryOptions } from "@/server/function/unit/unit.functions"

export const Route = createFileRoute("/_app/inventory/products/new")({
  head: () => ({ meta: [{ title: `${appConfig.name} - New Product` }] }),
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(unitsQueryOptions)
  },
})

function RouteComponent() {
  const serverFn = useServerFn(createProductFn)

  const { data: categories } = useQuery(categoriesQueryOptions)
  const { data: units } = useSuspenseQuery(unitsQueryOptions)

  const categoryOptions = React.useMemo(
    () =>
      categories?.map((category) => ({
        label: category.name,
        value: category.id,
      })) || [],
    [categories]
  )

  const unitOptions = React.useMemo(
    () =>
      units.map((unit) => ({
        label: unit.name,
        value: unit.id,
      })),
    [units]
  )

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

  const hasData = form.state.canSubmit && form.state.isDirty

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasData) {
        e.preventDefault()
      }
    }

    const handleGlobalClick = (e: MouseEvent) => {
      if (!hasData) return

      const target = (e.target as HTMLElement).closest("a")

      if (!target || !target.href) return

      if (target.target === "_blank") return

      const isHashLink =
        target.href.includes("#") &&
        target.pathname === window.location.pathname
      if (isHashLink) return

      e.preventDefault()

      const wantsToSave = window.confirm(
        "You have unsaved changes! Click OK to SAVE and leave, or Cancel to stay on this page."
      )

      if (wantsToSave) {
        form.handleSubmit()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("click", handleGlobalClick)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("click", handleGlobalClick)
    }
  }, [hasData])

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link
                  to="/inventory/products"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                </Link>
              }
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
            <div className="ml-2 flex gap-2">
              <form.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isDirty,
                  state.isSubmitting,
                ]}
              >
                {([canSubmit, isDirty, isSubmitting]) => (
                  <Button
                    type="submit"
                    form="product-form"
                    disabled={!canSubmit && !isDirty}
                    size="icon"
                    variant="link"
                  >
                    {isSubmitting ? <Spinner /> : <CloudUploadIcon />}
                  </Button>
                )}
              </form.Subscribe>
              <Link
                to="/inventory/products"
                className={buttonVariants({
                  variant: "outline",
                  size: "icon",
                })}
              >
                <XIcon />
              </Link>
            </div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid w-full flex-1 grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardContent>
            <form
              id="product-form"
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
                        <FieldLabel htmlFor={field.name}>
                          Product Name
                        </FieldLabel>
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
                      </Field>
                    )
                  }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="categoryId"
                    children={(field) => {
                      return (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                          <Select
                            items={categoryOptions}
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(value || "")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                {categoryOptions.map((category) => (
                                  <SelectItem
                                    key={category.value}
                                    value={category.value}
                                    className="capitalize"
                                  >
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
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
                          <FieldLabel htmlFor={field.name}>
                            Unit of Measure
                          </FieldLabel>
                          <Select
                            value={field.state.value || "pcs"}
                            onValueChange={(value) =>
                              field.handleChange(value || "pcs")
                            }
                            items={unitOptions}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              <SelectGroup>
                                <SelectLabel>UOM</SelectLabel>
                                {unitOptions.map((unit) => (
                                  <SelectItem
                                    key={unit.value}
                                    value={unit.value}
                                  >
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      )
                    }}
                  />
                </div>
                <form.Field
                  name="description"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Description
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          placeholder="Enter product description"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0">
          <CardContent>
            <h3 className="mb-3 font-medium">Audit Log</h3>
            <p className="text-muted-foreground text-sm">No activity yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
