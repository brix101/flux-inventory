import { Schema } from "effect";

import { User } from "./auth.ts";
import { PurchaseOrderId } from "./baseSchemas.ts";
import { PaginationMeta } from "./pagination.ts";
import { Supplier } from "./supplier.ts";

export const PurchaseOrder = Schema.Struct({
  id: PurchaseOrderId,
  status: Schema.Literals(["DRAFT", "APPROVED", "CANCELLED", "PARTIALLY_RECEIVED", "RECEIVED"]),
  notes: Schema.NullOr(Schema.String),
  name: Schema.String,
  expectedDate: Schema.NullOr(Schema.DateFromString),
  receivedDate: Schema.NullOr(Schema.DateFromString),
  totalAmount: Schema.String,
  lineTotal: Schema.String,
  isActive: Schema.Boolean,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.NullOr(Schema.DateFromString),
});
export type PurchaseOrder = typeof PurchaseOrder.Type;

export const PurchaseOrderWithRelations = Schema.Struct({
  ...PurchaseOrder.fields,
  supplier: Schema.NullOr(Supplier),
  created: Schema.NullOr(User),
  received: Schema.NullOr(User),
});

export class PurchaseOrderList extends Schema.Class<PurchaseOrderList>("PurchaseOrderList")({
  items: Schema.Array(PurchaseOrderWithRelations),
  meta: PaginationMeta,
}) {}
