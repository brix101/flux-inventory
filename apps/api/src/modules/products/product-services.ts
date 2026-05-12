import { ProductList } from "@flux/contracts";
import { and, count, eq } from "drizzle-orm";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { Database } from "../../database.ts";
import { productVariants } from "../../db/schema/inventory-schema.ts";
import { buildCursor } from "../../pagination.ts";

export class ProductService extends Context.Service<ProductService>()(
  "@flux/api/modules/products/product-services/ProductService",
  {
    make: Effect.gen(function* () {
      const db = yield* Database;

      const find = Effect.fn("ProductService.find")(function* (
        pageSize: number,
        cursorStr?: string,
        sortBy?: string,
      ) {
        const { cursorCondition, orderBy, generateNextCursor } = yield* buildCursor(
          productVariants,
          cursorStr,
          sortBy,
        );

        const baseWhere = eq(productVariants.isActive, true);

        return yield* db
          .use((client) =>
            client.transaction(async (tx) => {
              const finalWhere = cursorCondition ? and(baseWhere, cursorCondition) : baseWhere;

              const items = await tx.query.productVariants.findMany({
                where: finalWhere,
                with: {
                  product: {
                    with: {
                      category: true,
                    },
                  },
                },
                limit: pageSize,
                orderBy: orderBy,
              });

              const nextCursor = generateNextCursor(items, pageSize);

              const total = await tx
                .select({
                  count: count(),
                })
                .from(productVariants)
                .where(baseWhere)
                .execute()
                .then((res) => res[0]?.count ?? 0);

              return {
                items,
                meta: {
                  total,
                  pageSize,
                  nextCursor,
                  hasMore: !!nextCursor,
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
        find,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
