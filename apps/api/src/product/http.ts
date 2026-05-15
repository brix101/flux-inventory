import { Api } from "@flux/contracts";
import { CurrentUser } from "@flux/contracts/middleware";
import { Layer } from "effect";
import * as Effect from "effect/Effect";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";

import { ProductServiceLive } from "./Layers/ProductService.ts";
import { ProductService } from "./Services/ProductService.ts";

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
).pipe(Layer.provide(ProductServiceLive));
