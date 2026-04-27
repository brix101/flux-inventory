import type { PoolConfig } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"
import pg from "pg"

import * as schema from "./schema"

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
    | "unknown"
  readonly cause: pg.DatabaseError
}> {
  public override toString() {
    return `DatabaseError: ${this.cause.message}`
  }

  public get message() {
    return this.cause.message
  }
}

type Client = ReturnType<typeof drizzle<typeof schema, pg.Pool>>

export class Database extends Context.Service<Database>()("Database", {
  make: Effect.gen(function* () {
    const url = yield* Config.redacted("DATABASE_URL")
    const config: PoolConfig = {
      connectionString: Redacted.value(url),
    }

    const pool = yield* Effect.acquireRelease(
      Effect.sync(() => new pg.Pool(config)),
      (p) => Effect.promise(() => p.end())
    )

    yield* Effect.tryPromise(() => pool.query("SELECT 1")).pipe(
      Effect.timeoutOrElse({
        duration: "10 seconds",
        orElse: () =>
          Effect.fail(
            new DatabaseConnectionLostError({
              cause: new Error("[Database] Failed to connect: timeout"),
              message: "[Database] Failed to connect: timeout",
            })
          ),
      }),
      Effect.catchCause((cause) =>
        Effect.fail(
          new DatabaseConnectionLostError({
            cause,
            message: "[Database] Failed to connect",
          })
        )
      ),
      Effect.tap(() =>
        Effect.sync(() =>
          console.info("[Database Client]: Connection to database established.")
        )
      )
    )

    const client = drizzle(pool, {
      schema,
      casing: "snake_case",
    })

    const use = Effect.fn("database.use")(function* <T>(
      fn: (client: Client) => Promise<T>
    ) {
      return yield* Effect.tryPromise({
        try: () => fn(client),
        catch: (error): DatabaseError => {
          if (error instanceof pg.DatabaseError) {
            switch (error.code) {
              case "23505":
                return new DatabaseError({
                  type: "unique_violation",
                  cause: error,
                })
              case "23503":
                return new DatabaseError({
                  type: "foreign_key_violation",
                  cause: error,
                })
              case "08000":
                return new DatabaseError({
                  type: "connection_error",
                  cause: error,
                })
            }
          }

          throw error
        },
      })
    })

    return {
      db: client,
      use,
    }
  }),
}) {
  static readonly layer = Layer.effect(this, this.make)
}
