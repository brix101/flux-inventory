import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { Effect, Layer } from "effect";
import { FetchHttpClient, HttpRouter, HttpServerResponse } from "effect/unstable/http";
import * as NodeHttp from "node:http";

const helloRouter = HttpRouter.add(
  "GET",
  "/hello",
  Effect.gen(function* () {
    yield* Effect.sleep(1000); // Simulate some async work
    yield* Effect.log("Handled /hello request");
    return HttpServerResponse.jsonUnsafe({ message: "Hello, World!" });
  }),
);

const greetingsRouter = HttpRouter.add(
  "GET",
  "/greet/:name",
  Effect.gen(function* () {
    const params = yield* HttpRouter.params;
    const name = params.name;
    yield* Effect.sleep(500); // Simulate some async work
    yield* Effect.log(`Handled /greet/${name} request`);
    return HttpServerResponse.jsonUnsafe({ message: `Hello, ${name}!` });
  }),
);

export const browserApiCorsLayer = HttpRouter.cors({
  allowedMethods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["authorization", "content-type"],
  maxAge: 600,
});

const makeRoutesLayer = Layer.mergeAll(helloRouter, greetingsRouter).pipe(
  Layer.provide(browserApiCorsLayer),
);

export const serverLayer = HttpRouter.serve(makeRoutesLayer, {}).pipe(
  Layer.provideMerge(
    NodeHttpServer.layer(NodeHttp.createServer, {
      // host: "0.0.0.0",
      port: 8000,
    }),
  ),
  Layer.provideMerge(FetchHttpClient.layer),
  Layer.provide(NodeServices.layer),
);

Layer.launch(serverLayer).pipe(NodeRuntime.runMain);
