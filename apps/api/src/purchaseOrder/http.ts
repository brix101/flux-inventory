import { Api } from "@flux/contracts";
import { CurrentUser } from "@flux/contracts/middleware";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";

import { PurchaseOrderServiceLive } from "./Layer/PurchaseOrderService.ts";
import { PurchaseOrderService } from "./Services/PurchaseOrderService.ts";

export const PurchaseOrderHttpLive = HttpApiBuilder.group(
  Api,
  "purchaseOrders",
  Effect.fn(function* (handlers) {
    const services = yield* PurchaseOrderService;

    return handlers.handle("list", ({ query }) =>
      CurrentUser.pipe(Effect.flatMap(() => services.list(query))),
    );
    // .handle("create", ({ payload }) =>
    //   CurrentUser.pipe(Effect.flatMap(({ user }) => services.create(user, payload))),
    // );
  }),
).pipe(Layer.provide(PurchaseOrderServiceLive));
