import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { HttpRouter } from "effect/unstable/http";
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import * as NodeHttp from "node:http";

import { Auth, authRouteLayer } from "./auth.ts";
import { ApiConfig } from "./config.ts";
import { Database } from "./database.ts";

const SuccessSchema = Schema.Struct({
  message: Schema.String,
});

const ParamsSchema = Schema.Struct({
  name: Schema.String,
});

const MyApi = HttpApi.make("MyApi").add(
  HttpApiGroup.make("HelloGroup").add(
    HttpApiEndpoint.get("hello-world", "/", {
      success: SuccessSchema,
    }),
    HttpApiEndpoint.get("hello-name", "/hello/:name", {
      success: SuccessSchema,
      params: ParamsSchema,
    }),
  ),
  HttpApiGroup.make("GoodbyeGroup").add(
    HttpApiEndpoint.get("goodbye-world", "/goodbye", {
      success: SuccessSchema,
    }),
    HttpApiEndpoint.get("goodbye-name", "/goodbye/:name", {
      success: SuccessSchema,
      params: ParamsSchema,
    }),
  ),
);

const HelloApiLive = HttpApiBuilder.group(MyApi, "HelloGroup", (h) =>
  h
    .handle("hello-world", () => Effect.succeed({ message: "Hello, World!" }))
    .handle("hello-name", ({ params }) => Effect.succeed({ message: `Hello, ${params.name}!` })),
);

const GoodbyeApiLive = HttpApiBuilder.group(MyApi, "GoodbyeGroup", (h) =>
  h
    .handle("goodbye-world", () => Effect.succeed({ message: "Goodbye, World!" }))
    .handle("goodbye-name", ({ params }) =>
      Effect.succeed({ message: `Goodbye, ${params.name}!` }),
    ),
);

const apiRouterLayer = HttpApiBuilder.layer(MyApi).pipe(
  Layer.provide(HelloApiLive),
  Layer.provide(GoodbyeApiLive),
);

const HttpServerLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* ApiConfig;
    return NodeHttpServer.layer(NodeHttp.createServer, {
      host: config.host,
      port: config.port,
    });
  }),
);

const makesRoutesLayer = Layer.mergeAll(authRouteLayer, apiRouterLayer);

export const HttpLive = HttpRouter.serve(makesRoutesLayer, {}).pipe(
  Layer.provide(HttpServerLive),
  Layer.provide(Auth.layer),
  Layer.provide(Database.layer),
  Layer.provide(ApiConfig.layer),
);
