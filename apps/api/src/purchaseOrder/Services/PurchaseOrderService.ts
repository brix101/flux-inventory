import type { PurchaseOrderList, SearchParams } from "@flux/contracts";

import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export interface PurchaseOrderServiceShape {
  readonly list: (query: SearchParams) => Effect.Effect<PurchaseOrderList>;
}

export class PurchaseOrderService extends Context.Service<
  PurchaseOrderService,
  PurchaseOrderServiceShape
>()("@flux/api/purchaseOrder/Services/PurchaseOrderService") {}
