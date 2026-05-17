import type { SchemaError } from "effect/Schema";
import type { Simplify } from "effect/Types";
import type { HttpClientResponse } from "effect/unstable/http/HttpClientResponse";

import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Schema from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";

export interface HttpApiServiceClient<
  Self,
  Id extends string,
  Groups extends HttpApiGroup.Any,
> extends Context.Service<Self, HttpApiClient.Client<Groups, never, never>> {
  new (_: never): Context.ServiceClass.Shape<Id, HttpApiClient.Client<Groups, never, never>>;

  readonly runtime: ManagedRuntime.ManagedRuntime<never, Self>;

  readonly mutation: <
    GroupName extends HttpApiGroup.Name<Groups>,
    Name extends HttpApiEndpoint.Name<HttpApiGroup.Endpoints<Group>>,
    Group extends HttpApiGroup.Any = HttpApiGroup.WithName<Groups, GroupName>,
    Endpoint extends HttpApiEndpoint.Any = HttpApiEndpoint.WithName<
      HttpApiGroup.Endpoints<Group>,
      Name
    >,
    const ResponseMode extends HttpApiEndpoint.ClientResponseMode =
      HttpApiEndpoint.ClientResponseMode,
  >(
    group: GroupName,
    endpoint: Name,
    request: [Endpoint] extends [
      HttpApiEndpoint.HttpApiEndpoint<
        infer _Name,
        infer _Method,
        infer _Path,
        infer _Params,
        infer _Query,
        infer _Payload,
        infer _Headers,
        infer _Success,
        infer _Error,
        infer _R,
        infer _RE
      >,
    ]
      ? Simplify<HttpApiEndpoint.ClientRequest<_Params, _Query, _Payload, _Headers, ResponseMode>>
      : never,
  ) => [Endpoint] extends [
    HttpApiEndpoint.HttpApiEndpoint<
      infer _Name,
      infer _Method,
      infer _Path,
      infer _Params,
      infer _Query,
      infer _Payload,
      infer _Headers,
      infer _Success,
      infer _Error,
      infer _Middleware,
      infer _RE
    >,
  ]
    ? ResponseByMode<_Success["Type"], ResponseMode>
    : never;

  readonly query: <
    GroupName extends HttpApiGroup.Name<Groups>,
    Name extends HttpApiEndpoint.Name<HttpApiGroup.Endpoints<Group>>,
    Group extends HttpApiGroup.Any = HttpApiGroup.WithName<Groups, GroupName>,
    Endpoint extends HttpApiEndpoint.Any = HttpApiEndpoint.WithName<
      HttpApiGroup.Endpoints<Group>,
      Name
    >,
    const ResponseMode extends HttpApiEndpoint.ClientResponseMode = "decoded-only",
  >(
    group: GroupName,
    endpoint: Name,
    request: [Endpoint] extends [
      HttpApiEndpoint.HttpApiEndpoint<
        infer _Name,
        infer _Method,
        infer _Path,
        infer _Params,
        infer _Query,
        infer _Payload,
        infer _Headers,
        infer _Success,
        infer _Error,
        infer _R,
        infer _RE
      >,
    ]
      ? Simplify<HttpApiEndpoint.ClientRequest<_Params, _Query, _Payload, _Headers, ResponseMode>>
      : never,
  ) => [Endpoint] extends [
    HttpApiEndpoint.HttpApiEndpoint<
      infer _Name,
      infer _Method,
      infer _Path,
      infer _Params,
      infer _Query,
      infer _Payload,
      infer _Headers,
      infer _Success,
      infer _Error,
      infer _Middleware,
      infer _RE
    >,
  ]
    ? ResponseByMode<_Success["Type"], ResponseMode>
    : never;
}

export const Service =
  <Self>() =>
  <const Id extends string, ApiId extends string, Groups extends HttpApiGroup.Any>(
    id: Id,
    options: {
      readonly api: HttpApi.HttpApi<ApiId, Groups>;
      readonly httpClient: Layer.Layer<HttpApiGroup.ClientServices<Groups> | HttpClient.HttpClient>;
      readonly transformClient?:
        | ((client: HttpClient.HttpClient) => HttpClient.HttpClient)
        | undefined;
      readonly transformResponse?:
        | ((
            effect: Effect.Effect<unknown, unknown, unknown>,
          ) => Effect.Effect<unknown, unknown, unknown>)
        | undefined;
      readonly baseUrl?: URL | string | undefined;
    },
  ): HttpApiServiceClient<Self, Id, Groups> => {
    const self = Context.Service<Self, HttpApiClient.Client<Groups, never, never>>()(id) as any;
    const layer = Layer.effect(self, HttpApiClient.make(options.api, options));

    const runtimeFactory = ManagedRuntime.make;
    self.runtime = runtimeFactory(Layer.provide(layer, options.httpClient) as Layer.Layer<Self>);

    // @effect-diagnostics-next-line anyUnknownInErrorContext:off
    const catchErrors = Effect.catch((e: unknown) =>
      Schema.isSchemaError(e) || HttpClientError.isHttpClientError(e)
        ? Effect.die(e)
        : Effect.fail(e),
    );

    self.mutation = ((group: string, endpoint: string, request: any) => {
      const key: MutationKey = {
        group,
        endpoint,
        ...request,
      };

      return self.runtime.runPromise(
        // @ts-expect-error - We need to assert the type here because the HttpApiClient.Client type is not specific enough to infer the correct types for the group and endpoint.
        self.use((client) =>
          catchErrors(client[key.group][key.endpoint](key) as Effect.Effect<any>),
        ),
      );
    }) as any;

    self.query = ((
      group: string,
      endpoint: string,
      request: {
        readonly params?: any;
        readonly query?: any;
        readonly payload?: any;
        readonly headers?: any;
      },
    ) => {
      const key: QueryKey = {
        group,
        endpoint,
        params: request.params,
        query: request.query,
        payload: request.payload,
        headers: request.headers,
      };

      return self.runtime.runPromise(
        // @ts-expect-error - We need to assert the type here because the HttpApiClient.Client type is not specific enough to infer the correct types for the group and endpoint.
        self.use((client) =>
          catchErrors(
            client[key.group][key.endpoint](key) as Effect.Effect<
              any,
              HttpClientError.HttpClientError | SchemaError
            >,
          ),
        ),
      );
    }) as any;

    return self as HttpApiServiceClient<Self, Id, Groups>;
  };

interface MutationKey {
  group: string;
  endpoint: string;
  payload?: any;
}

interface QueryKey {
  group: string;
  endpoint: string;
  params: any;
  query: any;
  headers: any;
  payload: any;
}

type ResponseByMode<Success, ResponseMode extends HttpApiEndpoint.ClientResponseMode> = [
  ResponseMode,
] extends ["decoded-and-response"]
  ? [Success, HttpClientResponse]
  : [ResponseMode] extends ["response-only"]
    ? HttpClientResponse
    : Success;

// type ErrorByMode<
//   Error extends Schema.Top,
//   Middleware,
//   ResponseMode extends HttpApiEndpoint.ClientResponseMode,
// > =
//   | HttpApiMiddleware.Error<Middleware>
//   | HttpApiMiddleware.ClientError<Middleware>
//   | ([ResponseMode] extends ["response-only"] ? never : Error["Type"]);
