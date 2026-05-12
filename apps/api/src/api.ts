import * as HttpApi from "effect/unstable/httpapi/HttpApi";

import { ProductApi } from "./modules/products/product-api.ts";

export class Api extends HttpApi.make("Api").add(ProductApi).prefix("/api") {}
