import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import type { SearchSchema } from "@/server/schema/search.schema"
import { searchSchema } from "@/server/schema/search.schema"
import { getDbProducts } from "./product.server"

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator(searchSchema)
  .handler(async ({ data, context: { runEffect } }) => {
    const limit = data.limit || 20
    const res = await runEffect(getDbProducts(data))
    return {
      items: res.items,
      itemCount: res.itemCount,
      pageCount: Math.ceil(res.itemCount / limit),
    }
  })

export const productQueryOptions = (search: SearchSchema) =>
  queryOptions({
    queryKey: ["products", Object.values(search)],
    queryFn: () =>
      getProducts({
        data: search,
      }),
  })
