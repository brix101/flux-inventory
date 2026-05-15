import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import { Api } from "@flux/contracts";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpRouter } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import * as HttpApiSwagger from "effect/unstable/httpapi/HttpApiSwagger";
import * as NodeHttp from "node:http";

import { BetterAuthRouterLive } from "./auth/http.ts";
import { AuthServiceLive } from "./auth/Layer/AuthService.ts";
import { AuthMiddlewareLive } from "./auth/middleware.ts";
import { ApiConfig } from "./config.ts";
import { DatabaseServiceLive } from "./database/Layer/DatabaseService.ts";
import { ProductHttpLive } from "./product/http.ts";
import { PurchaseOrderHttpLive } from "./purchaseOrder/http.ts";

const ApiRouterLive = Layer.provide(HttpApiBuilder.layer(Api), [
  ProductHttpLive,
  PurchaseOrderHttpLive,
]);

const HttpServerLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* ApiConfig;
    return NodeHttpServer.layer(NodeHttp.createServer, {
      host: config.host,
      port: config.port,
    });
  }),
);

const HttpCorsLayer = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* ApiConfig;
    return HttpRouter.cors({
      credentials: true,
      allowedOrigins: config.trustedOrigins,
    });
  }),
);

const makesRoutesLayer = Layer.mergeAll(BetterAuthRouterLive, ApiRouterLive).pipe(
  Layer.provide(HttpCorsLayer),
);

export const HttpLive = HttpRouter.serve(makesRoutesLayer, {}).pipe(
  Layer.provide(HttpApiSwagger.layer(Api)),
  Layer.provide(HttpRouter.layer),
  Layer.provide(AuthMiddlewareLive),
  Layer.provide(HttpServerLive),
  Layer.provide(AuthServiceLive),
  Layer.provide(DatabaseServiceLive),
  Layer.provide(ApiConfig.layer),
);
