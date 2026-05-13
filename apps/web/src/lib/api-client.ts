import { DomainApi } from "@flux/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { HttpApiClient } from "effect/unstable/httpapi";
import * as Atom from "effect/unstable/reactivity/Atom";

export class ApiClient extends Context.Service<ApiClient>()("@flux/web/lib/api-client/ApiClient", {
  make: Effect.gen(function* () {
    const httpClient = yield* HttpApiClient.make(DomainApi, {
      baseUrl: "/api",
      transformClient: (client) =>
        client.pipe(
          HttpClient.filterStatusOk,
          HttpClient.retryTransient({
            times: 3,
            schedule: Schedule.exponential("1 second"),
          }),
        ),
    });

    return httpClient;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(FetchHttpClient.layer));
}

export class AtomApiClient extends Context.Service<AtomApiClient>()(
  "@flux/web/lib/api-client/AtomApiClient",
  {
    make: Effect.gen(function* () {
      const api = yield* ApiClient;

      return {
        list: () => api.ProductApi.list({ query: { pageSize: 20 } }),
      };
    }),
  },
) {}

export const runtime = Atom.runtime(ApiClient.layer);
