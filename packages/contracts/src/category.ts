import { Schema } from "effect";

import { CategoryId } from "./baseSchemas.ts";

export class Category extends Schema.Class<Category>("Category")({
  id: CategoryId,
  name: Schema.NonEmptyString,
  description: Schema.NullOr(Schema.String),
  color: Schema.NullOr(Schema.String),
}) {}
