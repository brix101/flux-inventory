import type { UserInfo } from "@flux/contracts";
import type { Unauthorized } from "@flux/contracts/middleware";
import type { HttpServerError } from "effect/unstable/http/HttpServerError";
import type { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import type { HttpServerResponse } from "effect/unstable/http/HttpServerResponse";

import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";

export interface AuthServiceShape {
  readonly handler: Effect.Effect<HttpServerResponse, HttpServerError, HttpServerRequest>;
  readonly getSession: (
    headers: Headers,
  ) => Effect.Effect<Option.None<UserInfo> | Option.Some<UserInfo>, Unauthorized, never>;
}

export class AuthService extends Context.Service<AuthService, AuthServiceShape>()(
  "@flux/api/auth/Services/AuthService",
) {}
