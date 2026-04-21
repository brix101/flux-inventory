import z from "zod"

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name is too long"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  categoryId: z.uuid("Invalid category ID format").optional(),
  unit: z.string().default("pcs"),
  variantName: z.string().default("Standard"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
