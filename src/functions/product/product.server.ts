import type { CreateProductInput } from "./schema"
import { db } from "@/db"
import { products, productVariants } from "@/db/schema"
import { generateSKU } from "@/lib/sku"

export async function createProduct(data: CreateProductInput) {
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

    return {
      ...newProduct,
      variants,
    }
  })
}
