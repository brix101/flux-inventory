import { UserInfo } from "@flux/contracts";
import { AuthMiddleware, CurrentUser, Unauthorized } from "@flux/contracts/middleware";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { HttpEffect, HttpRouter } from "effect/unstable/http";

import { ApiConfig } from "./config.ts";
import { Database } from "./Database.ts";

export const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete"], // <-- Permissions available for created roles
  // manager: ["*"], // <-- Super admin has access to all permissions without needing them to be specified
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  project: ["create"],
});

export const manager = ac.newRole({
  project: ["create", "update"],
  user: ["list", "create", "update"],
});

export const admin = ac.newRole({
  project: ["create", "update", "delete"],
  ...adminAc.statements,
});

export class Auth extends Context.Service<Auth>()("@flux/api/Auth", {
  make: Effect.gen(function* () {
    const config = yield* ApiConfig;
    const db = yield* Database;

    const auth = betterAuth({
      database: drizzleAdapter(db.client, {
        provider: "pg",
        usePlural: true,
      }),
      trustedOrigins: ["http://localhost:5173"],
      secret: Redacted.value(config.betterAuthSecret),
      baseURL: config.betterAuthUrl,
      emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        sendResetPassword: async ({ user: { email }, url, token }) => {
          const parsed = new URL(url);
          const baseUrl = parsed.origin;

          const resetLink = `${baseUrl}/reset-password?token=${token}`;

          console.log({
            to: email,
            subject: "Reset your password",
            text: `Click the link to reset your password: ${resetLink}`,
          });
          console.log(resetLink);
        },
      },
      plugins: [
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
    });

    const handler = HttpEffect.fromWebHandler(auth.handler);

    const getSession = Effect.fn("auth.getSession")(function* (headers: Headers) {
      const result = yield* Effect.tryPromise({
        try: () => auth.api.getSession({ headers }),
        catch: () => new Unauthorized({ message: "Unauthorized" }),
      });

      if (!result) return Option.none();

      return yield* Schema.decodeUnknownEffect(Schema.toType(UserInfo))(result).pipe(
        Effect.map(Option.some),
        Effect.catchTags({
          SchemaError: (error) =>
            Effect.gen(function* () {
              yield* Effect.logError(`Failed to decode session: ${error.message}`);
              return Option.none();
            }),
        }),
      );
    });

    return {
      handler,
      getSession,
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

export const BetterAuthRouterLive = HttpRouter.use((router) =>
  router.add(
    "*",
    "/api/auth*",
    Effect.gen(function* () {
      const auth = yield* Auth;

      return yield* auth.handler;
    }),
  ),
);

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
