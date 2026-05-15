import { PurchaseOrderList, SortBySchema, type SearchParams } from "@flux/contracts";
import { asc, count, desc, eq, getTableColumns, SQL } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { purchaseOrders } from "../../database/schema/inventory-schema.ts";
import { DatabaseService } from "../../database/Services/DatabaseService.ts";
import {
  PurchaseOrderService,
  type PurchaseOrderServiceShape,
} from "../Services/PurchaseOrderService.ts";

const columns = getTableColumns(purchaseOrders);

const makePurchaseOrderService = Effect.gen(function* () {
  const db = yield* DatabaseService;

  const list = Effect.fn("PurchaseOrderService.list")(function* (query: SearchParams) {
    const { page = 1, pageSize = 20, sort = "" } = query;
    const [column, direction] = yield* Schema.decodeEffect(SortBySchema)(sort).pipe(
      Effect.catch(() => Effect.succeed(["createdAt", "desc"] as const)),
    );

    const where = eq(purchaseOrders.isActive, true);

    return yield* db
      .use((client) =>
        client.transaction(async (tx) => {
          const orderBy: SQL<unknown>[] = [];
          if (column in columns) {
            const sortedColumn = columns[column as keyof typeof columns];
            const sortDirection = direction === "asc" ? asc : desc;
            orderBy.push(sortDirection(sortedColumn));
          }

          const items = await tx.query.purchaseOrders.findMany({
            with: {
              created: true,
              supplier: true,
              received: true,
            },
            where: where,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            orderBy: orderBy,
          });

          const total = await tx
            .select({
              count: count(),
            })
            .from(purchaseOrders)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          return {
            items,
            meta: {
              total,
              page,
              pageSize,
              totalPages: Math.ceil(total / pageSize),
              nextPage: page * pageSize < total ? page + 1 : null,
            },
          };
        }),
      )
      .pipe(
        Effect.flatMap(Schema.decodeEffect(PurchaseOrderList)),
        Effect.withSpan("PurchaseOrderService.list", { attributes: { query } }),
        Effect.catchTags({
          DatabaseError: (error) => Effect.die(error),
          SchemaError: (error) => Effect.die(error),
        }),
      );
  });

  return {
    list,
  } satisfies PurchaseOrderServiceShape;
});

export const PurchaseOrderServiceLive = Layer.effect(
  PurchaseOrderService,
  makePurchaseOrderService,
);
