import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { CategoryId } from "../category/category.domain"

export const CreateProductSchema = Schema.Struct({
  name: Schema.String.check(
    Schema.isMinLength(3, {
      message: "Product name must be at least 3 characters",
    }),
    Schema.isMaxLength(100, { message: "Product name is too long" })
  ),
  description: Schema.optional(
    Schema.String.check(
      Schema.isMaxLength(500, {
        message: "Description cannot exceed 500 characters",
      })
    )
  ),
  categoryId: Schema.optional(CategoryId),
  unit: Schema.String.pipe(
    Schema.withConstructorDefault(Effect.succeed("pcs"))
  ),
})

export type CreateProductInput = typeof CreateProductSchema.Type
