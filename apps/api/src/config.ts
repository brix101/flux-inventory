/**
 * ServerConfig - Runtime configuration services.
 *
 * Defines process-level server configuration and networking helpers used by
 * startup and runtime layers.
 *
 * @module ApiConfig
 */
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LogLevel from "effect/LogLevel";
import * as Redacted from "effect/Redacted";

/**
 * ApiConfigShape - Process/runtime configuration required by the server.
 */
export interface ApiConfigShape {
  readonly logLevel: LogLevel.LogLevel;
  readonly port: number;
  readonly host: string | undefined;
  readonly databaseUrl: Redacted.Redacted;
  readonly betterAuthSecret: Redacted.Redacted;
  readonly betterAuthUrl: string;
}

/**
 * ApiConfig - Service tag for server runtime configuration.
 */
export class ApiConfig extends Context.Service<ApiConfig, ApiConfigShape>()(
  "@flux/api/config/ApiConfig",
) {
  static readonly layer = Layer.effect(
    ApiConfig,
    Effect.gen(function* () {
      const logLevel = yield* Config.literals(LogLevel.values, "LOG_LEVEL").pipe(
        Config.withDefault("Info"),
      );
      const port = yield* Config.int("PORT").pipe(Config.withDefault(8000));
      const host = yield* Config.string("HOST").pipe(Config.withDefault(undefined));
      const databaseUrl = yield* Config.redacted("DATABASE_URL");
      const betterAuthSecret = yield* Config.redacted("BETTER_AUTH_SECRET");
      const betterAuthUrl = yield* Config.string("BETTER_AUTH_URL");

      return {
        logLevel,
        port,
        host,
        databaseUrl,
        betterAuthSecret,
        betterAuthUrl,
      };
    }),
  );
}
