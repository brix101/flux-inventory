import type { SearchParams } from "@flux/contracts";

import { queryOptions } from "@tanstack/react-query";

import { runtime } from "~/lib/runtime";

import { productsList } from "./api";

export const productListOptions = (searchParams: SearchParams) =>
  queryOptions({
    queryKey: ["products", searchParams],
    queryFn: () => runtime.runPromise(productsList(searchParams)),
  });
