import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import type { SearchSchema } from "@/server/schema/search.schema"
import { searchSchema } from "@/server/schema/search.schema"
import { getDbProducts as getDbProductsEffect } from "./product.effect"
import { getDbProducts } from "./product.server"

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator(searchSchema)
  .handler(async ({ data }) => {
    const limit = data.limit || 20
    const result = await getDbProducts(data)
    return {
      items: result.items,
      itemCount: result.itemCount,
      pageCount: Math.ceil(result.itemCount / limit),
    }
  })

export const getProductsEffect = createServerFn({ method: "GET" })
  .inputValidator(searchSchema)
  .handler(async ({ data, context: { runEffect } }) => {
    const limit = data.limit || 20
    const effectResult = await runEffect(getDbProductsEffect(data))
    return {
      items: effectResult.items,
      itemCount: effectResult.itemCount,
      pageCount: Math.ceil(effectResult.itemCount / limit),
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

export const productQueryOptionsEffect = (search: SearchSchema) =>
  queryOptions({
    queryKey: ["products-effect", Object.values(search)],
    queryFn: () =>
      getProductsEffect({
        data: search,
      }),
  })
