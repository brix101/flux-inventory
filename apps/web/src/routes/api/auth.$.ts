import { createFileRoute } from "@tanstack/react-router"
import * as Effect from "effect/Effect"

import { Auth } from "@/server/lib/Auth"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request, context: { runEffect } }) =>
        runEffect(
          Effect.gen(function* () {
            const auth = yield* Auth
            return yield* auth.handler(request)
          })
        ),
      POST: async ({ request, context: { runEffect } }) =>
        runEffect(
          Effect.gen(function* () {
            const auth = yield* Auth
            return yield* auth.handler(request)
          })
        ),
    },
  },
})
