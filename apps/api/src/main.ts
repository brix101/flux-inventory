import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeHttpServerRequest from "@effect/platform-node/NodeHttpServerRequest";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { toNodeHandler } from "better-auth/node";
import { config } from "dotenv";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { HttpRouter, HttpServerRequest } from "effect/unstable/http";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import * as NodeHttp from "node:http";

import { Auth } from "./Auth.ts";
import { Database } from "./Database.ts";

config({ path: [".env.local", ".env"] });

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

const betterAuthHandler = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;

  const auth = yield* Auth;

  return yield* auth.handler(request);
});

const betterAuthGetRouter = HttpRouter.add("GET", "/api/auth/*", betterAuthHandler);
const betterAuthPostRouter = HttpRouter.add("POST", "/api/auth/*", betterAuthHandler);

const makeRoutesLayer = Layer.mergeAll(betterAuthGetRouter, betterAuthPostRouter);

const MyApiLive = HttpApiBuilder.layer(MyApi).pipe(
  Layer.provide(HelloApiLive),
  Layer.provide(GoodbyeApiLive),
);

const HttpServerLive = Layer.unwrap(
  Effect.gen(function* () {
    // const config = yield* ServerConfig;
    yield* Effect.logInfo("Starting HTTP server...");
    return NodeHttpServer.layer(NodeHttp.createServer, {
      //   host: config.host,
      //   port: config.port,
      port: 8000,
    });
  }),
);

const ApiLive = Layer.mergeAll(makeRoutesLayer, MyApiLive);

const ServerLive = HttpRouter.serve(ApiLive, {
  //   disableLogger: true,
}).pipe(Layer.provide(HttpServerLive), Layer.provide(Auth.layer), Layer.provide(Database.layer));

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
