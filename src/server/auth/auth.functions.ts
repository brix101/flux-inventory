import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { Auth } from "."

export const getSession = createServerFn({ method: "GET" }).handler(
  async ({ context: { runEffect } }) =>
    runEffect(
      Effect.gen(function* () {
        const headers = getRequestHeaders()
        const auth = yield* Auth

        const session = yield* auth.getSession(headers)

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
        const headers = getRequestHeaders()
        const auth = yield* Auth

        const session = yield* auth.getSession(headers)

        if (Option.isNone(session)) {
          throw new Error("Unauthorized")
        }

        return session.value
      })
    )
)

export const signOutServerFn = createServerFn({ method: "POST" }).handler(
  ({ context: { runEffect } }) =>
    runEffect(
      Effect.gen(function* () {
        const headers = getRequestHeaders()
        const auth = yield* Auth
        yield* auth.use((api) => api.signOut({ headers }))
        return yield* Effect.die(redirect({ to: "/login" }))
      })
    )
)
