import { Api } from "@flux/contracts";
import { CurrentUser } from "@flux/contracts/middleware";
import * as Effect from "effect/Effect";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";

import { ProductService } from "./product-services.ts";

export const ProductHttpLive = HttpApiBuilder.group(
  Api,
  "products",
  Effect.fn(function* (handlers) {
    const services = yield* ProductService;

    return handlers
      .handle("list", ({ query }) => CurrentUser.pipe(Effect.flatMap(() => services.list(query))))
      .handle("create", ({ payload }) =>
        CurrentUser.pipe(Effect.flatMap(({ user }) => services.create(user, payload))),
      );
  }),
);
