import { useAtomSet } from "@effect/atom-react";
import { CreateProductInput } from "@flux/contracts";
import { useForm } from "@tanstack/react-form";
import * as Schema from "effect/Schema";

import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import { ApiClient } from "~/lib/api-client";

export const units = [
  { id: "pcs", name: "Pieces (pcs)" },
  { id: "kg", name: "Kilograms (kg)" },
  { id: "g", name: "Grams (g)" },
  { id: "m", name: "Meters (m)" },
  { id: "cm", name: "Centimeters (cm)" },
  { id: "L", name: "Liters (L)" },
  { id: "ml", name: "Milliliters (ml)" },
  { id: "box", name: "Box" },
  { id: "pack", name: "Pack" },
] as const;

function NewProductForm() {
  const categoryOptions = [
    {
      value: "1463528d-ef62-476b-8983-656ae87fa9ee",
      label: "Category 1",
    },
    {
      value: "1a2b8997-0f13-4b5c-818a-d77880b7724b",
      label: "Category 2",
    },
  ];
  const unitOptions = units.map((unit) => ({ value: unit.id, label: unit.name }));

  const createProduct = useAtomSet(ApiClient.mutation("products", "create"));

  const form = useForm({
    defaultValues: {
      name: "",
      unit: "pcs",
      categoryId: "",
      description: "",
    },
    validators: {
      onChange: Schema.toStandardSchemaV1(CreateProductInput),
    },
    onSubmit: async ({ value }) => {
      createProduct({
        payload: value,
        reactivityKeys: ["products"],
      });
      form.reset();
    },
  });

  return (
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
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                  <Select
                    items={categoryOptions}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value || "")}
                  >
                    <SelectTrigger aria-invalid={isInvalid}>
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
        <Field>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? <Spinner /> : "Submit"}
              </Button>
            )}
          </form.Subscribe>
        </Field>
      </FieldGroup>
    </form>
  );
}

export default NewProductForm;
