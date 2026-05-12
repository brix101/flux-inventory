import type { AnyPgTable } from "drizzle-orm/pg-core";

import { CursorSchema, type Cursor } from "@flux/contracts";
import { and, or, gt, eq, asc, getTableColumns, type SQL } from "drizzle-orm";
import { Schema } from "effect";
import * as Effect from "effect/Effect";

export const buildCursor = <TTable extends AnyPgTable>(
  table: TTable,
  cursorStr?: string,
  sortBy?: string,
) =>
  Effect.gen(function* () {
    const availableColumns = getTableColumns(table) as Record<string, any>;

    // 1. Validate the sort string
    let validSortColumn: string | undefined = undefined;
    if (sortBy && sortBy in availableColumns) {
      validSortColumn = sortBy;
    }

    // 2. Safely decode using Effect.try
    const cursor = yield* Effect.gen(function* () {
      if (!cursorStr) return undefined;

      // 1. Decode Base64 to a JSON string
      const jsonString = Buffer.from(cursorStr, "base64").toString("utf-8");

      // 2. Parse the JSON and validate it against the CursorSchema
      const decode = Schema.decodeUnknownEffect(Schema.fromJsonString(CursorSchema));

      return yield* decode(jsonString);
    }).pipe(Effect.catch(() => Effect.succeed(undefined)));

    // 3. Build the dynamic cursor condition
    let cursorCondition: SQL | undefined = undefined;
    if (cursor) {
      const idColumn = availableColumns["id"];

      if (validSortColumn && cursor.value !== undefined) {
        const dynamicColumn = availableColumns[validSortColumn];
        const value = cursor.value;

        cursorCondition = or(
          gt(dynamicColumn, value),
          and(eq(dynamicColumn, value), gt(idColumn, cursor.id)),
        );
      } else {
        cursorCondition = gt(idColumn, cursor.id);
      }
    }

    // 4. Build orderBy
    const orderBy = validSortColumn
      ? [asc(availableColumns[validSortColumn]), asc(availableColumns["id"])]
      : [asc(availableColumns["id"])];

    // 5. Provide a helper function to generate the next cursor
    const generateNextCursor = (items: any[], pageSize: number): string | null => {
      if (items.length !== pageSize) return null;

      const lastItem = items[items.length - 1];
      if (!lastItem) return null;

      const nextCursorObj: Cursor = {
        id: lastItem.id,
        ...(validSortColumn ? { value: lastItem[validSortColumn] } : {}),
      };

      return Buffer.from(JSON.stringify(nextCursorObj)).toString("base64");
    };

    return {
      cursorCondition,
      orderBy,
      generateNextCursor,
    };
  });
