import type { CreateProductInput } from "./schema"
import { db } from "@/db"
import { auditLogs, products, productVariants } from "@/db/schema"
import { generateSKU } from "@/lib/sku"

export async function getDbProducts() {
  try {
    const items = await db.query.productVariants.findMany({
      where: (variant, { eq }) => eq(variant.isActive, true),
      with: {
        product: true,
      },
    })

    return items
  } catch (e) {
    console.error("Failed to fetch products:", e)
    return []
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

    const variantName = data.variantName || "Standard"

    const sku = generateSKU(newProduct.name, variantName, 0)

    const variants = await tx
      .insert(productVariants)
      .values({
        productId: newProduct.id,
        sku: sku,
        name: variantName,
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
