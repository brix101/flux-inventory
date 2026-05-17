import {
  type SearchParams,
  SortBySchema,
  ProductList,
  CreateProductInput,
  User,
  ProductVariantWithProduct,
} from "@flux/contracts";
import { eq, SQL, asc, desc, count, getTableColumns } from "drizzle-orm";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { products, productVariants } from "../../database/schema/index.ts";
import { DatabaseService } from "../../database/Services/DatabaseService.ts";
import { ProductService } from "../Services/ProductService.ts";
import { generateSKU } from "../utils.ts";

const columns = getTableColumns(productVariants);

export const makeProductService = Effect.gen(function* () {
  const db = yield* DatabaseService;

  const list = Effect.fn("ProductService.list")(function* (query: SearchParams) {
    const { page = 1, size = 20, sort = "" } = query;
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
            limit: size,
            offset: (page - 1) * size,
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
              size,
              totalPages: Math.ceil(total / size),
              nextPage: page * size < total ? page + 1 : null,
            },
          };
        }),
      )
      .pipe(
        Effect.flatMap(Schema.decodeEffect(ProductList)),
        Effect.withSpan("ProductService.list", { attributes: { query } }),
        Effect.catchTags({
          DatabaseError: (error) => Effect.die(error),
          SchemaError: (error) => Effect.die(error),
        }),
      );
  });

  const create = Effect.fn("ProductService.create")(function* (
    user: User,
    payload: CreateProductInput,
  ) {
    return yield* db
      .withAudit(user)
      .use(async (tx) => {
        const category = await tx.query.categories.findFirst({
          where(fields, { eq }) {
            return eq(fields.id, payload.categoryId);
          },
        });

        const result = await tx
          .insert(products)
          .values({
            name: payload.name,
            description: payload.description,
            categoryId: payload.categoryId,
          })
          .returning();

        const newProduct = result[0]!;

        const variantName = "Standard";
        const variantId = crypto.randomUUID();

        const sku = generateSKU(newProduct.id, variantId);

        const newVariants = await tx
          .insert(productVariants)
          .values({
            id: variantId,
            productId: newProduct.id,
            sku: payload.sku || sku,
            name: variantName,
            unit: payload.unit,
          })
          .returning();

        const newVariant = newVariants[0]!;

        return {
          ...newVariant,
          product: {
            ...newProduct,
            category,
          },
        };
      })
      .pipe(
        Effect.flatMap(Schema.decodeEffect(ProductVariantWithProduct)),
        Effect.withSpan("ProductService.create", { attributes: { user, payload } }),
        Effect.catchTags({
          DatabaseError: (error) => Effect.die(error),
          SchemaError: (error) => Effect.die(error),
        }),
      );
  });

  return {
    list,
    create,
  };
});

export const ProductServiceLive = Layer.effect(ProductService, makeProductService);
