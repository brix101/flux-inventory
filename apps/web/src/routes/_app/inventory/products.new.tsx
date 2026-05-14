import { CreateProductSchema } from "@flux/contracts";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Schema from "effect/Schema";
import { CloudUploadIcon, Package, XIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";

export const Route = createFileRoute("/_app/inventory/products/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const categoryOptions = [{
    value: "1463528d-ef62-476b-8983-656ae87fa9ee",
    label: "Category 1",
  }, {
    value: "1a2b8997-0f13-4b5c-818a-d77880b7724b",
    label: "Category 2",
  }];
  const unitOptions = [];

  const form = useForm({
    defaultValues: {
      name: "",
      unit: "pcs",
    },
    validators: {
      onChange: Schema.toStandardSchemaV1(CreateProductSchema),
    },
    // onSubmit: async ({ value }) => serverFn({ data: value }),
  });

  const hasData = form.state.canSubmit && form.state.isDirty;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link to="/inventory/products" className="flex items-center gap-2">
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
                selector={(state) => [state.canSubmit, state.isDirty, state.isSubmitting]}
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
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
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
                            onValueChange={(value) => field.handleChange(value || "")}
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
                      );
                    }}
                  />
                  <form.Field
                    name="unit"
                    children={(field) => {
                      return (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Unit of Measure</FieldLabel>
                          <Select
                            value={field.state.value || "pcs"}
                            onValueChange={(value) => field.handleChange(value || "pcs")}
                            items={unitOptions}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              <SelectGroup>
                                <SelectLabel>UOM</SelectLabel>
                                {unitOptions.map((unit) => (
                                  <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      );
                    }}
                  />
                </div>
                <form.Field
                  name="description"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                        <Textarea
                          id={field.name}
                          placeholder="Enter product description"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
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
  );
}
