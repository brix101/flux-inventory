import type { SearchParams } from "@flux/contracts";

import { mutationOptions, queryOptions } from "@tanstack/react-query";

import { HttpApiService } from "~/lib/api-client";

export const productListQueryOptions = (searchParams: SearchParams) =>
  queryOptions({
    queryKey: ["products", searchParams],
    queryFn: async () => HttpApiService.query("products", "list", { query: searchParams }),
  });

export const createProductMutationOptions = mutationOptions({
  mutationKey: ["products", "create"],
  mutationFn: HttpApiService.mutation("products", "create"),
});
