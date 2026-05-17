import { Api } from "@flux/contracts";
import { AuthMiddleware } from "@flux/contracts/middleware";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { HttpApiMiddleware } from "effect/unstable/httpapi";
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import * as AtomHttpApi from "effect/unstable/reactivity/AtomHttpApi";

import * as CustomHttpApi from "./api-service.ts";

export class AtomApiClient extends AtomHttpApi.Service<AtomApiClient>()(
  "@flux/web/lib/api-client/AtomApiClient",
  {
    api: Api,
    httpClient: FetchHttpClient.layer,
    transformClient: (client) =>
      client.pipe(
        HttpClient.filterStatusOk,
        HttpClient.retryTransient({
          times: 3,
          schedule: Schedule.exponential("1 second"),
        }),
      ),
    baseUrl: "/",
  },
) {}

export const AuthorizationClient = HttpApiMiddleware.layerClient(
  AuthMiddleware,
  Effect.fn(function* ({ next, request }) {
    // Here you can modify the request and pass it down the middleware chain.
    // This is where you would add authentication tokens, custom headers, etc.
    // For this example, we just add a hardcoded bearer token to all requests.
    return yield* next(HttpClientRequest.bearerToken(request, "dev-token"));
  }),
);

export class ApiClient extends Context.Service<ApiClient, HttpApiClient.ForApi<typeof Api>>()(
  "@flux/web/lib/api-client/ApiClient",
) {
  static readonly layer = Layer.effect(
    ApiClient,
    HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.filterStatusOk,
          HttpClient.retryTransient({
            times: 3,
            schedule: Schedule.exponential("1 second"),
          }),
        ),
    }),
  ).pipe(
    // Provide the client implementation of the Authorization middleware, which
    // is required.
    Layer.provide(AuthorizationClient),
    // Supply a HttpClient implementation to use for making requests. Here we
    // use the FetchHttpClient, but you could also use the NodeHttpClient or
    // BunHttpClient.
    Layer.provide(FetchHttpClient.layer),
  );
}

export class HttpApiService extends CustomHttpApi.Service<HttpApiService>()(
  "@flux/web/lib/api-service/HttpApiService",
  {
    api: Api,
    httpClient: FetchHttpClient.layer,
    transformClient: (client) =>
      client.pipe(
        HttpClient.filterStatusOk,
        HttpClient.retryTransient({
          times: 3,
          schedule: Schedule.exponential("1 second"),
        }),
      ),
    baseUrl: "/",
  },
) {}
