import { Schema } from "effect";

import { SupplierId } from "./baseSchemas.ts";

export const Supplier = Schema.Struct({
  id: SupplierId,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  notes: Schema.NullOr(Schema.String),
  isActive: Schema.Boolean,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.NullOr(Schema.DateFromString),
});
export type Supplier = typeof Supplier.Type;
