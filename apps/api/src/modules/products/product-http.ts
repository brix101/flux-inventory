import * as Effect from "effect/Effect";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";

import { Api } from "../../api.ts";
import { ProductService } from "./product-services.ts";

export const ProductHttpLive = HttpApiBuilder.group(Api, "ProductApi", (b) =>
  Effect.gen(function* () {
    const services = yield* ProductService;
    return b
      .handle("list", ({ query }) => {
        const { pageSize = 20, cursor, sortBy } = query;
        return services.find(pageSize, cursor, sortBy);
      })
      .handle("create", ({ payload }) => {
        console.log(payload);

        return Effect.succeed({ message: "Product created successfully" });
      });
  }),
);
