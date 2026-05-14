import { ProductList, SortBySchema, type SearchParams } from "@flux/contracts";
import { asc, count, desc, eq, getTableColumns, SQL } from "drizzle-orm";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { Database } from "../../Database.ts";
import { productVariants } from "../../db/schema/inventory-schema.ts";

const columns = getTableColumns(productVariants);

export class ProductService extends Context.Service<ProductService>()(
  "@flux/api/modules/products/product-services/ProductService",
  {
    make: Effect.gen(function* () {
      const db = yield* Database;

      const list = Effect.fn("ProductService.list")(function* (query: SearchParams) {
        const { page = 1, pageSize = 20, sort = "" } = query;
        const [column, direction] = yield* Schema.decodeEffect(SortBySchema)(sort).pipe(
          Effect.catch(() => Effect.succeed(["createdAt", "desc"] as const)),
        );

        const where = eq(productVariants.isActive, true);

        return yield* db
          .use((client) =>
            client.transaction(async (tx) => {
              const orderBy: SQL<unknown>[] = [];
              if (column in columns) {
                const sortedColumn = columns[column as keyof typeof columns];
                const sortDirection = direction === "asc" ? asc : desc;
                orderBy.push(sortDirection(sortedColumn));
              }

              const items = await tx.query.productVariants.findMany({
                with: {
                  product: {
                    with: {
                      category: true,
                    },
                  },
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
                .from(productVariants)
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
            Effect.flatMap(Schema.decodeEffect(ProductList)),
            Effect.catchTags({
              DatabaseError: (error) =>
                Effect.die(new Error(`Database error while fetching products: ${error.message}`)),
              SchemaError: (error) =>
                Effect.die(new Error(`Failed to decode ProductList: ${error.message}`)),
            }),
          );
      });

      return {
        find: list,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
