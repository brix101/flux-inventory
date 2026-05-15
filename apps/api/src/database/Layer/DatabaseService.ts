import type { User } from "@flux/contracts";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as Redacted from "effect/Redacted";
import pg from "pg";

import { ApiConfig } from "../../config.ts";
import * as schema from "../schema/index.ts";
import {
  DatabaseConnectionLostError,
  DatabaseError,
  DatabaseService,
  type DatabaseServiceShape,
  type DrizzleClient,
  type DrizzleTransaction,
} from "../Services/DatabaseService.ts";

const catchError = (error: unknown): DatabaseError =>
  Match.value(error).pipe(
    Match.when(
      (e: any) => e?.code === "23505" || e?.cause?.code === "23505",
      () => new DatabaseError({ type: "unique_violation", cause: error }),
    ),
    Match.when(
      (e: any) => e?.code === "23503" || e?.cause?.code === "23503",
      () => new DatabaseError({ type: "foreign_key_violation", cause: error }),
    ),
    Match.when(
      (e: any) => e?.code === "08000" || e?.cause?.code === "08000",
      () => new DatabaseError({ type: "connection_error", cause: error }),
    ),
    Match.orElse(() => new DatabaseError({ type: "unknown_error", cause: error })),
  );

const makeDatabaseService = Effect.gen(function* () {
  const config = yield* ApiConfig;

  const pool = yield* Effect.acquireRelease(
    Effect.sync(
      () =>
        new pg.Pool({
          connectionString: Redacted.value(config.databaseUrl),
        }),
    ),
    (conn) => Effect.promise(() => conn.end()),
  );

  yield* Effect.tryPromise(() => pool.query("SELECT 1")).pipe(
    Effect.timeoutOrElse({
      duration: "10 seconds",
      orElse: () =>
        Effect.fail(
          new DatabaseConnectionLostError({
            cause: new Error("[Database] Failed to connect: timeout"),
            message: "[Database] Failed to connect: timeout",
          }),
        ),
    }),
    Effect.catchCause((cause) =>
      Effect.fail(
        new DatabaseConnectionLostError({
          cause,
          message: "[Database] Failed to connect",
        }),
      ),
    ),
    Effect.tap(() => Effect.logInfo("[Database client]: Connection to the database established.")),
  );

  const client = drizzle(pool, {
    schema,
    casing: "snake_case",
  });

  const use = Effect.fn("database.use")(function* <T>(fn: (client: DrizzleClient) => Promise<T>) {
    return yield* Effect.tryPromise({
      try: () => fn(client),
      catch: catchError,
    });
  });

  const withAudit = (user: User) => ({
    use: Effect.fn("database.withAudit")(function* <T>(fn: (tx: DrizzleTransaction) => Promise<T>) {
      return yield* Effect.tryPromise({
        try: () =>
          client.transaction(async (tx) => {
            await tx.execute(sql`SELECT set_config('app.user_id', ${user.id}, true)`);
            return fn(tx);
          }),
        catch: catchError,
      });
    }),
  });

  return {
    client,
    use,
    withAudit,
  } satisfies DatabaseServiceShape;
});

export const DatabaseServiceLive = Layer.effect(DatabaseService, makeDatabaseService);
