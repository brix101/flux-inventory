import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

import { getCategories } from "./category.server"

export const getCategoriesFn = createServerFn({ method: "GET" }).handler(
  async ({ context: { runEffect } }) => {
    const categories = await runEffect(getCategories())
    return categories
  }
)

export const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () =>
    getCategoriesFn({
      data: undefined,
    }),
})
