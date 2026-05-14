import { Schema, Effect } from "effect";

import { CategoryId, ProductId } from "./baseSchemas.ts";
import { Category } from "./category.ts";
import { PaginationMeta } from "./pagination.ts";

export const CreateProductSchema = Schema.Struct({
  name: Schema.String.check(
    Schema.isMinLength(3, {
      message: "Product name must be at least 3 characters",
    }),
    Schema.isMaxLength(100, { message: "Product name is too long" }),
  ),
  description: Schema.optional(
    Schema.String.check(
      Schema.isMaxLength(500, {
        message: "Description cannot exceed 500 characters",
      }),
    ),
  ),
  categoryId: Schema.optional(CategoryId),
  unit: Schema.String.pipe(Schema.withConstructorDefault(Effect.succeed("pcs"))),
  sku: Schema.optional(Schema.String),
});
export type CreateProductSchema = typeof CreateProductSchema.Type;

export class Product extends Schema.Class<Product>("Product")({
  id: ProductId,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  categoryId: Schema.NullOr(CategoryId),
  isActive: Schema.Boolean,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.NullOr(Schema.DateFromString),
}) {}

export class ProductWithCategory extends Schema.Class<ProductWithCategory>("ProductWithCategory")({
  ...Product.fields,
  category: Schema.NullOr(Category),
}) {}

export class ProductVariant extends Schema.Class<ProductVariant>("ProductVariant")({
  id: ProductId,
  name: Schema.NonEmptyString,
  // description: Schema.optional(Schema.String),
  // categoryId: Schema.optional(CategoryId),
  sku: Schema.NonEmptyString,
  barcode: Schema.NullOr(Schema.String),
  unit: Schema.NullOr(Schema.String),
  imageUrl: Schema.NullOr(Schema.String),
  isActive: Schema.Boolean,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.NullOr(Schema.DateFromString),
}) {}

export class ProductVariantWithProduct extends Schema.Class<ProductVariantWithProduct>(
  "ProductVariantWithProduct",
)({
  ...ProductVariant.fields,
  product: ProductWithCategory,
}) {}

export class ProductWithVariants extends Schema.Class<ProductWithVariants>("ProductWithVariants")({
  ...Product.fields,
  variants: Schema.Array(ProductVariant),
}) {}

export class ProductList extends Schema.Class<ProductList>("ProductList")({
  items: Schema.Array(ProductVariantWithProduct),
  meta: PaginationMeta,
}) {}
