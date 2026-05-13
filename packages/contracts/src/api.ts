import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";

import { SuccessSchema } from "./baseSchemas.ts";
import { SearchParamsSchema } from "./pagination.ts";
import { ProductList, CreateProductSchema } from "./product.ts";

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
      success: SuccessSchema,
    }),
  )
  .prefix("/products") {}

export class DomainApi extends HttpApi.make("DomainApi").add(ProductApi).prefix("/api") {}
