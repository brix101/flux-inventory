import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { AppRequest } from "@/server/lib/AppRequest"
import { Auth } from "@/server/lib/Auth"

export class AuthError extends Data.TaggedError("AuthError")<{}> {}

export class UnauthorizedError extends Data.TaggedError(
  "UnauthorizedError"
)<{}> {}

export const getSession = createServerFn({ method: "GET" }).handler(
  async ({ context: { runEffect } }) =>
    runEffect(
      Effect.gen(function* () {
        const request = yield* AppRequest
        const auth = yield* Auth

        const session = yield* auth.getSession(request.headers)

        if (Option.isNone(session)) {
          return null
        }

        return session.value
      })
    )
)

export const ensureSession = createServerFn({ method: "GET" }).handler(
  async ({ context: { runEffect } }) =>
    runEffect(
      Effect.gen(function* () {
        const request = yield* AppRequest
        const auth = yield* Auth

        const session = yield* auth.getSession(request.headers)

        if (Option.isNone(session)) {
          return yield* new UnauthorizedError()
        }

        return session.value
      })
    )
)

export const signOutServerFn = createServerFn({ method: "POST" }).handler(
  ({ context: { runEffect } }) =>
    runEffect(
      Effect.gen(function* () {
        const request = yield* AppRequest
        const auth = yield* Auth

        yield* auth.use((api) => api.signOut({ headers: request.headers }))
        return yield* Effect.die(redirect({ to: "/login" }))
      })
    )
)
