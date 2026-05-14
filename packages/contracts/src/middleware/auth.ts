import * as Context from "effect/Context";
import * as Schema from "effect/Schema";
import { HttpApiMiddleware, HttpApiSecurity } from "effect/unstable/httpapi";

import { UserInfo } from "../auth.ts";

export class CurrentUser extends Context.Service<CurrentUser, UserInfo>()(
  "@flux/api/AuthMiddleware/CurrentUser",
) {}

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {
    message: Schema.String,
  },
  // You can define error status codes directly on the error class
  { httpApiStatus: 401 },
) {}

export class AuthMiddleware extends HttpApiMiddleware.Service<
  AuthMiddleware,
  {
    // Middleware can provide services to other middleware and endpoints, which is
    // useful for things like authentication, where you want to inject the current
    // user into the context for other endpoints to consume.
    provides: CurrentUser;
    // If your middleware requires dependencies from other middleware, you can
    // specify those as well.
    requires: never;
  }
>()("@flux/api/AuthMiddleware", {
  // This middleware requires clients to also provide an implementation, to
  // inject a api key
  requiredForClient: true,
  // Middleware can optionally define security schemes, which are used to
  // generate OpenAPI docs and decode credientials from incoming requests for
  // you.
  security: {
    cookie: HttpApiSecurity.apiKey({
      in: "cookie",
      key: "better-auth.session_token",
    }),
  },
  // Middlware can specify errors that it may raise
  error: Unauthorized,
}) {}
