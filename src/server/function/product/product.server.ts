import { and, count, eq } from "drizzle-orm"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import type { SearchSchema } from "../../schema/search.schema"
import type { CreateProductInput } from "./schema"
import { generateSKU } from "@/lib/sku"
import { AppRequest } from "@/server/AppRequest"
import { Auth } from "@/server/auth"
import { Database } from "@/server/db"
import { products, productVariants } from "@/server/db/schema"

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
            product: true,
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

    const session = yield* auth.getSession(req.headers)

    if (Option.isNone(session)) {
      return yield* Effect.fail(new Error("Unauthorized"))
    }

    const userId = session.value.user.id

    const result = yield* db.withAudit(userId, async (tx) => {
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

      return {
        ...newProduct,
        variants,
      }
    })

    return result
  })
}
