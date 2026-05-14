import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";

import { AuthMiddleware } from "./middleware/auth.ts";
import { SearchParamsSchema } from "./pagination.ts";
import { ProductList, CreateProductSchema, ProductWithVariants } from "./product.ts";

export class ProductApi extends HttpApiGroup.make("products")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: SearchParamsSchema,
      success: ProductList,
    }),
  )
  .add(
    HttpApiEndpoint.post("create", "/", {
      payload: CreateProductSchema,
      success: ProductWithVariants,
    }),
  )
  .prefix("/products") {}

export class Api extends HttpApi.make("Api")
  .add(ProductApi)
  .middleware(AuthMiddleware)
  .prefix("/api") {}
