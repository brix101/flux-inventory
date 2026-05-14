import { AuthMiddleware, CurrentUser, Unauthorized } from "@flux/contracts/middleware";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";

import { Auth } from "./Auth.ts";

export const AuthMiddlewareLayer = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;

    return AuthMiddleware.of({
      cookie: Effect.fn(function* (httpEffect, { credential }) {
        const headers = new Headers({
          cookie: `better-auth.session_token=${Redacted.value(credential)}`,
        });

        const session = yield* auth.getSession(headers);

        if (Option.isNone(session)) {
          return yield* new Unauthorized({ message: "Unauthorized" });
        }

        return yield* Effect.provideService(httpEffect, CurrentUser, session.value);
      }),
    });
  }),
);
