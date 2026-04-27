import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import type { SearchSchema } from "@/server/schema/search.schema"
import { searchSchema } from "@/server/schema/search.schema"
import { createProduct, getDbProducts } from "./product.server"
import { createProductSchema } from "./schema"

export const getProductsFn = createServerFn({ method: "GET" })
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
      getProductsFn({
        data: search,
      }),
  })

export const createProductFn = createServerFn({ method: "POST" })
  .inputValidator(createProductSchema)
  .handler(async ({ data, context: { runEffect } }) =>
    runEffect(createProduct(data))
  )
