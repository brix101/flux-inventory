import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";

import { AuthMiddleware } from "./middleware/auth.ts";
import { SearchParamsSchema } from "./pagination.ts";
import { ProductList, CreateProductInput, ProductWithVariants } from "./product.ts";
import { PurchaseOrderList } from "./purchaseOrders.ts";

export class ProductApi extends HttpApiGroup.make("products")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: SearchParamsSchema,
      success: ProductList,
    }),
  )
  .add(
    HttpApiEndpoint.post("create", "/", {
      payload: CreateProductInput,
      success: ProductWithVariants,
    }),
  )
  .prefix("/products") {}

export class PurchaseOrderApi extends HttpApiGroup.make("purchaseOrders")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: SearchParamsSchema,
      success: PurchaseOrderList,
    }),
  )
  .prefix("/purchase-orders") {}

export class Api extends HttpApi.make("Api")
  .add(ProductApi)
  .add(PurchaseOrderApi)
  .middleware(AuthMiddleware)
  .prefix("/api") {}
