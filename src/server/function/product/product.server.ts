import { and, count, eq } from "drizzle-orm"

import type { SearchSchema } from "@/server/schema/search.schema"
import type { CreateProductInput } from "./schema"
import { db } from "@/db"
import { auditLogs, products, productVariants } from "@/db/schema"
import { generateSKU } from "@/lib/sku"

export async function getDbProducts(_params: SearchSchema) {
  try {
    const result = await db.transaction(async (tx) => {
      const where = and(eq(productVariants.isActive, true))

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
        totalCount,
      }
    })

    return {
      items: result.items,
      itemCount: result.totalCount,
    }
  } catch (e) {
    console.error("Failed to fetch products:", e)
    return {
      items: [],
      itemCount: 0,
    }
  }
}

export async function createProduct(data: CreateProductInput, userId: string) {
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
}
