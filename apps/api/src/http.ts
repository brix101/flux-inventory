import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import { Api } from "@flux/contracts";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpRouter } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import * as HttpApiSwagger from "effect/unstable/httpapi/HttpApiSwagger";
import * as NodeHttp from "node:http";

import { BetterAuthRouterLive, Auth } from "./Auth.ts";
import { AuthMiddlewareLayer } from "./AuthMiddleware.ts";
import { ApiConfig } from "./config.ts";
import { Database } from "./Database.ts";
import { ProductHttpLive } from "./modules/products/product-http.ts";
import { ProductService } from "./modules/products/product-services.ts";

const apiRouterLayer = Layer.provide(HttpApiBuilder.layer(Api), [ProductHttpLive]);

const servicesLayer = Layer.mergeAll(ProductService.layer);

const HttpServerLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* ApiConfig;
    return NodeHttpServer.layer(NodeHttp.createServer, {
      host: config.host,
      port: config.port,
    });
  }),
);

const apiCorsLayer = HttpRouter.cors({
  credentials: true,
  allowedOrigins: ["http://localhost:5173"], // TODO: Move to config
});

const makesRoutesLayer = Layer.mergeAll(BetterAuthRouterLive, apiRouterLayer).pipe(
  Layer.provide(apiCorsLayer),
);

export const HttpLive = HttpRouter.serve(makesRoutesLayer, {}).pipe(
  Layer.provide(HttpApiSwagger.layer(Api)),
  Layer.provide(HttpRouter.layer),
  Layer.provide(AuthMiddlewareLayer),
  Layer.provide(HttpServerLive),
  Layer.provide(servicesLayer),
  Layer.provide(Auth.layer),
  Layer.provide(Database.layer),
  Layer.provide(ApiConfig.layer),
);
