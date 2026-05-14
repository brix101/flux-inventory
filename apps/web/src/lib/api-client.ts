import { Api } from "@flux/contracts";
import * as Schedule from "effect/Schedule";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as AtomHttpApi from "effect/unstable/reactivity/AtomHttpApi";

export class ApiClient extends AtomHttpApi.Service<ApiClient>()("ApiClient", {
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
}) {}
