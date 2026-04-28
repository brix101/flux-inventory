import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin as adminPlugin, organization } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"

import * as Domain from "@/server/Domain"
import { Database } from "../db"
import { ac, admin, manager, user } from "./permissions"

export class Auth extends Context.Service<Auth>()("Auth", {
  make: Effect.gen(function* () {
    const { client } = yield* Database

    const auth = betterAuth({
      database: drizzleAdapter(client, {
        provider: "pg",
        usePlural: true,
      }),
      emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        sendResetPassword: async ({ user: { email }, url, token }) => {
          const parsed = new URL(url)
          const baseUrl = parsed.origin

          const resetLink = `${baseUrl}/reset-password?token=${token}`

          console.log({
            to: email,
            subject: "Reset your password",
            text: `Click the link to reset your password: ${resetLink}`,
          })
          console.log(resetLink)
        },
      },
      plugins: [
        tanstackStartCookies(),
        adminPlugin({
          ac,
          roles: {
            user,
            admin,
            manager,
          },
          adminRoles: ["admin", "manager"],
        }),
        organization(),
      ],
      advanced: {
        ipAddress: {
          ipAddressHeaders: ["CF-Connecting-IP"],
        },
      },
    })

    const handler = Effect.fn("auth.handler")(function* (request: Request) {
      return yield* Effect.tryPromise(() => auth.handler(request))
    })

    /**
     * Resolves the current session from request headers and validates it into
     * `Domain.User` / `Domain.Session`.
     *
     * `Domain.*` schemas decode D1 rows (encoded side: ints, ISO strings,
     * plain strings) into the domain shape (decoded side: booleans, Dates,
     * branded ids). Better Auth's `auth.api.getSession` returns the **decoded
     * side already** — its adapter coerced D1 rows before we see them.
     * Running `Schema.decodeUnknownEffect(Domain.User)` on that output would
     * fail because the transforms expect the encoded shape as input.
     *
     * `Schema.toType(S)` derives a schema whose `Encoded === Type ===
     * S["Type"]` — a validator over the decoded shape. It enforces that
     * Better Auth's output actually matches `Domain.User` / `Domain.Session`
     * (including branded ids) without re-running the D1 transforms.
     */
    const getSession = Effect.fn("auth.getSession")(function* (
      headers: Headers
    ) {
      const result = yield* Effect.tryPromise(() =>
        auth.api.getSession({ headers })
      )
      if (!result) return Option.none()
      const decodedUser = yield* Schema.decodeUnknownEffect(
        Schema.toType(Domain.User)
      )(result.user)
      const decodedSession = yield* Schema.decodeUnknownEffect(
        Schema.toType(Domain.Session)
      )(result.session)
      return Option.some({ user: decodedUser, session: decodedSession })
    })

    const use = Effect.fn("auth.use")(function* <T>(
      fn: (api: typeof auth.api) => Promise<T>
    ) {
      return yield* Effect.tryPromise(() => fn(auth.api))
    })

    return {
      auth,
      api: auth.api,
      use,
      handler,
      getSession,
    }
  }),
}) {
  static readonly layer = Layer.effect(this, this.make)
}
