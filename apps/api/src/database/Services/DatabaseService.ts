import type { User } from "@flux/contracts";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";

import { drizzle, type NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import pg from "pg";

import * as schema from "../schema/index.ts";

export class DatabaseConnectionLostError extends Data.TaggedError("DatabaseConnectionLostError")<{
  cause: unknown;
  message: string;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly type:
    | "unique_violation"
    | "foreign_key_violation"
    | "connection_error"
    | "unknown_error";
  readonly cause: unknown;
}> {
  public override get message(): string {
    if (this.cause instanceof Error) {
      return this.cause.message;
    }

    if (this.cause && typeof this.cause === "object" && "message" in this.cause) {
      return String(this.cause.message);
    }

    return String(this.cause);
  }

  public override toString(): string {
    return `DatabaseError [${this.type}]: ${this.message}`;
  }
}

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema, pg.Pool>>;
export type DrizzleTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export interface DatabaseServiceShape {
  readonly client: DrizzleClient;
  readonly use: <T>(
    fn: (client: DrizzleClient) => Promise<T>,
  ) => Effect.Effect<T, DatabaseError, never>;
  readonly withAudit: (user: User) => {
    readonly use: <T>(
      fn: (client: DrizzleTransaction) => Promise<T>,
    ) => Effect.Effect<T, DatabaseError, never>;
  };
}

export class DatabaseService extends Context.Service<DatabaseService, DatabaseServiceShape>()(
  "@flux/api/database/Services/DatabaseService",
) {}
