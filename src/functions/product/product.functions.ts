import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import { getDbProducts } from "./product.server"

export const getProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const items = await getDbProducts()
    return items
  }
)

export const productQueryOptions = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  })
