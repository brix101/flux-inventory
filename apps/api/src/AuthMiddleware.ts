import { AuthMiddleware, CurrentUser, Unauthorized, UserSession } from "@flux/contracts/middleware";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";

import { Auth } from "./Auth.ts";

export const AuthMiddlewareLayer = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;
    yield* Effect.log("AuthMiddleware initialized");

    return AuthMiddleware.of({
      cookie: Effect.fn(function* (httpEffect, { credential }) {
        const session = yield* auth
          .getSession(
            new Headers({
              cookie: `better-auth.session_token=${Redacted.value(credential)}`,
            }),
          )
          .pipe(Effect.catch(() => Effect.succeed(Option.none())));

        if (Option.isNone(session)) {
          return yield* new Unauthorized({ message: "Unauthorized" });
        }

        return yield* Effect.provideService(
          httpEffect,
          CurrentUser,
          new UserSession({
            user: session.value.user,
            session: session.value.session,
          }),
        );
      }),
    });
  }),
);
