import type {
  CreateProductInput,
  ProductList,
  ProductVariantWithProduct,
  SearchParams,
  User,
} from "@flux/contracts";

import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export interface ProductServiceShape {
  readonly list: (query: SearchParams) => Effect.Effect<ProductList>;
  readonly create: (
    user: User,
    payload: CreateProductInput,
  ) => Effect.Effect<ProductVariantWithProduct>;
}

export class ProductService extends Context.Service<ProductService, ProductServiceShape>()(
  "@flux/api/product/Services/ProductService",
) {}
