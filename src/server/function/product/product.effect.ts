import { and, count, eq } from "drizzle-orm"
import { Data, Effect } from "effect"

import type { SearchSchema } from "../../schema/search.schema"
import type { CreateProductInput } from "./schema"
import { generateSKU } from "@/lib/sku"
import { db } from "@/server/db"
import { auditLogs, products, productVariants } from "@/server/db/schema"

export class ProductError extends Data.TaggedError("ProductError")<{
  readonly cause: unknown
  readonly message: string
}> {}

export function getDbProducts(_params: SearchSchema) {
  return Effect.gen(function* () {
    const where = and(eq(productVariants.isActive, true))

    const items = yield* Effect.tryPromise({
      try: async () => {
        return await db.transaction(async (tx) => {
          return await tx.query.productVariants.findMany({
            where: where,
            with: {
              product: true,
            },
          })
        })
      },
      catch: (cause) =>
        new ProductError({ cause, message: "Failed to fetch products" }),
    })

    const totalCount = yield* Effect.tryPromise({
      try: async () => {
        return await db
          .select({
            count: count(),
          })
          .from(productVariants)
          .where(where)
          .execute()
          .then((res) => res[0].count || 0)
      },
      catch: (cause) =>
        new ProductError({ cause, message: "Failed to count products" }),
    })

    return {
      items,
      itemCount: totalCount,
    }
  })
}

export function createProduct(data: CreateProductInput, userId: string) {
  return Effect.tryPromise({
    try: async () => {
      return await db.transaction(async (tx) => {
        const [newProduct] = await tx
          .insert(products)
          .values({
            name: data.name,
            description: data.description,
            categoryId: data.categoryId,
          })
          .returning()

        const variant = "Standard"

        const sku = generateSKU(newProduct.name, variant, 0)

        const variants = await tx
          .insert(productVariants)
          .values({
            productId: newProduct.id,
            sku: sku,
            name: variant,
            unit: data.unit,
          })
          .returning()

        await tx.insert(auditLogs).values({
          userId,
          action: "CREATE",
          entityName: products._.name,
          entityId: newProduct.id,
          oldValue: null,
          newValue: JSON.stringify(newProduct),
        })

        return {
          ...newProduct,
          variants,
        }
      })
    },
    catch: (cause) =>
      new ProductError({ cause, message: "Failed to create product" }),
  })
}
