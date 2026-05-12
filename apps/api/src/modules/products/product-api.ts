import { CreateProductSchema, ProductList, SearchParams, SuccessSchema } from "@flux/contracts";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";

export class ProductApi extends HttpApiGroup.make("ProductApi")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: SearchParams,
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
