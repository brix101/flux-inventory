import { type SearchParams } from "@flux/contracts";
import { queryOptions } from "@tanstack/react-query";

import { runtime } from "~/lib/runtime";

import { purchaseOrdersList } from "./api";

export const purchaseOrderListQueryOptions = (searchParams: SearchParams) =>
  queryOptions({
    queryKey: ["purchase-orders", searchParams],
    queryFn: () => runtime.runPromise(purchaseOrdersList(searchParams)),
  });
