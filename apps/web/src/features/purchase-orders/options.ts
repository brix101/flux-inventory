import { type SearchParams } from "@flux/contracts";
import { queryOptions } from "@tanstack/react-query";

import { HttpApiService } from "~/lib/api-client";

export const purchaseOrderListQueryOptions = (searchParams: SearchParams) =>
  queryOptions({
    queryKey: ["purchase-orders", searchParams],
    queryFn: async () => HttpApiService.query("purchaseOrders", "list", { query: searchParams }),
  });
