import * as NodeHttpServerRequest from "@effect/platform-node/NodeHttpServerRequest";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNodeHandler } from "better-auth/node";
import { admin as adminPlugin, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http";

import { ApiConfig } from "./config.ts";
import { Database } from "./database.ts";
import * as Domain from "./Domain.ts";

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{}> {}
export class BeterAuthError extends Data.TaggedError("BeterAuthError")<{
  message: string;
}> {}

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

export class Auth extends Context.Service<Auth>()("@flux/api/auth", {
  make: Effect.gen(function* () {
    const config = yield* ApiConfig;
    const db = yield* Database;

    const auth = betterAuth({
      database: drizzleAdapter(db.client, {
        provider: "pg",
        usePlural: true,
      }),
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

    const handler = Effect.fn("auth.handler")(function* (
      request: HttpServerRequest.HttpServerRequest,
    ) {
      const nodeRequest = NodeHttpServerRequest.toIncomingMessage(request);
      const nodeResponse = NodeHttpServerRequest.toServerResponse(request);

      yield* Effect.tryPromise({
        try: () => toNodeHandler(auth)(nodeRequest, nodeResponse),
        catch: (error) => {
          console.log(error);
          return new BeterAuthError({ message: "Authentication failed" });
        },
      });

      return HttpServerResponse.empty({
        status: nodeResponse.writableFinished ? nodeResponse.statusCode : 499,
      });
    });

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
    const getSession = Effect.fn("auth.getSession")(function* (headers: Headers) {
      const result = yield* Effect.tryPromise(() => auth.api.getSession({ headers }));
      if (!result) return Option.none();
      const decodedUser = yield* Schema.decodeUnknownEffect(Schema.toType(Domain.User))(
        result.user,
      );
      const decodedSession = yield* Schema.decodeUnknownEffect(Schema.toType(Domain.Session))(
        result.session,
      );
      return Option.some({ user: decodedUser, session: decodedSession });
    });

    const ensureSession = Effect.fn("auth.ensureSession")(function* (headers: Headers) {
      const session = yield* getSession(headers);

      if (Option.isNone(session)) {
        return yield* new UnauthorizedError();
      }

      return session.value;
    });

    const use = Effect.fn("auth.use")(function* <T>(fn: (api: typeof auth.api) => Promise<T>) {
      return yield* Effect.tryPromise(() => fn(auth.api));
    });

    return {
      use,
      handler,
      getSession,
      ensureSession,
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

const betterAuthHandler = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;

  const auth = yield* Auth;

  return yield* auth.handler(request);
});

const betterAuthGetRouter = HttpRouter.add("GET", "/api/auth/*", betterAuthHandler);
const betterAuthPostRouter = HttpRouter.add("POST", "/api/auth/*", betterAuthHandler);

export const authRouteLayer = Layer.mergeAll(betterAuthGetRouter, betterAuthPostRouter);
