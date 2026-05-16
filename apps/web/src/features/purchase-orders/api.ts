import type { SearchParams } from "@flux/contracts";

import * as Effect from "effect/Effect";

import { ApiClient } from "~/lib/api-client";

export const purchaseOrdersList = (searchParams: SearchParams) =>
  Effect.gen(function* () {
    const client = yield* ApiClient;
    return yield* client.purchaseOrders.list({ query: searchParams });
  });
