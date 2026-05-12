import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LogLevel from "effect/LogLevel";

/**
 * ApiConfigShape - Process/runtime configuration required by the server.
 */
export interface ApiConfigShape {
  readonly logLevel: LogLevel.LogLevel;
  readonly port: number;
  readonly host: string | undefined;
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

      return {
        logLevel,
        port,
        host,
      };
    }),
  );
}
