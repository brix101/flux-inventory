import * as Schema from "effect/Schema"

export const CategoryId = Schema.NonEmptyString.pipe(Schema.brand("CategoryId"))
export type CategoryId = typeof CategoryId.Type
