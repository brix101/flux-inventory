import * as crypto from "node:crypto"
import { and, count, eq } from "drizzle-orm"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"

import type { SearchSchema } from "../../schema/search.schema"
import type { CreateProductInput } from "./product.domain"
import { generateSKU } from "@/lib/sku"
import { products, productVariants } from "@/server/db/schema"
import { AppRequest } from "@/server/lib/AppRequest"
import { Auth } from "@/server/lib/Auth"
import { Database } from "@/server/lib/Database"

export class ProductError extends Data.TaggedError("ProductError")<{
  readonly cause: unknown
  readonly message: string
}> {}

export function getDbProducts(_params: SearchSchema) {
  return Effect.gen(function* () {
    const db = yield* Database

    const where = and(eq(productVariants.isActive, true))

    return yield* db.use((client) =>
      client.transaction(async (tx) => {
        const items = await tx.query.productVariants.findMany({
          where: where,
          with: {
            product: {
              with: {
                category: true,
              },
            },
          },
        })

        const totalCount = await tx
          .select({
            count: count(),
          })
          .from(productVariants)
          .where(where)
          .execute()
          .then((res) => res[0].count || 0)

        return {
          items,
          itemCount: totalCount,
        }
      })
    )
  })
}

export function createProduct(data: CreateProductInput) {
  return Effect.gen(function* () {
    const req = yield* AppRequest
    const db = yield* Database
    const auth = yield* Auth

    const session = yield* auth.ensureSession(req.headers)

    const userId = session.user.id

    const result = yield* db.withAudit(userId, async (tx) => {
      const [newProduct] = await tx
        .insert(products)
        .values({
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
        })
        .returning()

      const variantName = "Standard"
      const variantId = crypto.randomUUID()

      const sku = generateSKU(newProduct.id, variantId)

      const variants = await tx
        .insert(productVariants)
        .values({
          id: variantId,
          productId: newProduct.id,
          sku: data.sku || sku,
          name: variantName,
          unit: data.unit,
        })
        .returning()

      return {
        ...newProduct,
        variants,
      }
    })

    return result
  })
}
