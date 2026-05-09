import type { ExtractTablesWithRelations } from "drizzle-orm"
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres"
import type { PgTransaction } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import * as Cause from "effect/Cause"
import * as Context from "effect/Context"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Match from "effect/Match"
import pg from "pg"

import * as schema from "../db/schema"
import { CloudflareEnv } from "./CloudflareEnv"

export class DatabaseConnectionLostError extends Data.TaggedError(
  "DatabaseConnectionLostError"
)<{
  cause: unknown
  message: string
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly type:
    | "unique_violation"
    | "foreign_key_violation"
    | "connection_error"
    | "unknown_error"
  readonly cause: unknown
}> {
  public get message(): string {
    if (this.cause instanceof Error) {
      return this.cause.message
    }

    if (
      this.cause &&
      typeof this.cause === "object" &&
      "message" in this.cause
    ) {
      return String(this.cause.message)
    }

    return String(this.cause)
  }

  public override toString(): string {
    return `DatabaseError [${this.type}]: ${this.message}`
  }
}

type Client = ReturnType<typeof drizzle<typeof schema, pg.Pool>>

type DBTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

const handleDatabaseError = (error: unknown): DatabaseError =>
  Match.value(error).pipe(
    Match.when(
      (e: any) => e?.code === "23505" || e?.cause?.code === "23505",
      () => new DatabaseError({ type: "unique_violation", cause: error })
    ),
    Match.when(
      (e: any) => e?.code === "23503" || e?.cause?.code === "23503",
      () => new DatabaseError({ type: "foreign_key_violation", cause: error })
    ),
    Match.when(
      (e: any) => e?.code === "08000" || e?.cause?.code === "08000",
      () => new DatabaseError({ type: "connection_error", cause: error })
    ),
    Match.orElse(
      () => new DatabaseError({ type: "unknown_error", cause: error })
    )
  )

interface QueryLogger {
  logQuery: (query: string, params: readonly unknown[]) => Effect.Effect<void>
}

export const QueryLogger = Context.Service<QueryLogger>("QueryLogger")

export const queryLogger = Context.make(QueryLogger, {
  logQuery: (query, params) =>
    Effect.logDebug("[Drizzle]").pipe(
      Effect.annotateLogs({
        Query: query,
        Params: params,
      })
    ),
})

export interface DatabaseShape {
  db: Client
  use: <T>(
    fn: (client: Client) => Promise<T>
  ) => Effect.Effect<T, DatabaseError, never>
  withAudit: <T>(
    userId: string,
    fn: (tx: DBTransaction) => Promise<T>
  ) => Effect.Effect<T, DatabaseError, never>
}

const make = () =>
  Effect.gen(function* () {
    const env = yield* CloudflareEnv

    const pool = yield* Effect.acquireRelease(
      Effect.sync(
        () =>
          new pg.Pool({
            connectionString: env.DATABASE_URL,
          })
      ),
      (conn) => Effect.promise(() => conn.end())
    )

    yield* Effect.tryPromise(() => pool.query("SELECT 1")).pipe(
      Effect.timeoutOrElse({
        duration: "10 seconds",
        orElse: () =>
          Effect.fail(
            new DatabaseConnectionLostError({
              cause: new Error("[Database] Failed to connect: timeout"),
              message: "[Database] Connection failed: timeout after 10 seconds",
            })
          ),
      }),
      Effect.catchCause((cause) =>
        Effect.fail(
          new DatabaseConnectionLostError({
            cause,
            message: "[Database] Connection lost: " + Cause.pretty(cause),
          })
        )
      ),
      Effect.tap(() => Effect.logDebug("[Database] Connection established."))
    )

    const db = drizzle(pool, {
      schema,
      casing: "snake_case",
      logger: {
        logQuery(query: string, params: unknown[]) {
          const program = Effect.gen(function* () {
            const logger = yield* QueryLogger
            yield* logger.logQuery(query, params)
          })

          Effect.runSyncWith(queryLogger)(program)
        },
      },
    })

    const use = Effect.fn("database.use")(function* <T>(
      fn: (client: Client) => Promise<T>
    ) {
      return yield* Effect.tryPromise({
        try: () => fn(db),
        catch: handleDatabaseError,
      })
    })

    const withAudit = Effect.fn("database.withAudit")(function* <T>(
      userId: string,
      fn: (tx: DBTransaction) => Promise<T>
    ) {
      return yield* Effect.tryPromise({
        try: () =>
          db.transaction(async (tx) => {
            await tx.execute(
              sql`SELECT set_config('app.user_id', ${userId}, true)`
            )
            return fn(tx)
          }),
        catch: handleDatabaseError,
      })
    })

    return {
      db,
      use,
      withAudit,
    }
  })

export class Database extends Context.Service<Database, DatabaseShape>()(
  "@flux/server/Database"
) {
  static readonly layer = Layer.effect(Database, make())
}
