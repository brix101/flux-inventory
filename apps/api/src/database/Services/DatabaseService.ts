import type { User } from "@flux/contracts";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";

import { drizzle, type NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import pg from "pg";

import type { DatabaseError } from "../Errors.ts";

import * as schema from "../schema/index.ts";

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
      fn: (tx: DrizzleTransaction) => Promise<T>,
    ) => Effect.Effect<T, DatabaseError, never>;
  };
}

export class DatabaseService extends Context.Service<DatabaseService, DatabaseServiceShape>()(
  "@flux/api/database/Services/DatabaseService",
) {}
