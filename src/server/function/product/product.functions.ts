import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import type { DatabaseError } from "@/server/lib/Database"
import type { SearchSchema } from "@/server/schema/search.schema"
import { ResponseError } from "@/server/lib/AppError"
import { searchSchema } from "@/server/schema/search.schema"
import { CreateProductSchema } from "./product.domain"
import { createProduct, getDbProducts } from "./product.server"

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
  .inputValidator(Schema.toStandardSchemaV1(CreateProductSchema))
  .handler(({ data, context: { runEffect } }) =>
    runEffect(
      createProduct(data).pipe(
        Effect.catchTags({
          DatabaseError: (error: DatabaseError) => {
            const messages: Record<string, string> = {
              unique_violation: "A product with the same name already exists.",
              foreign_key_violation: "Referenced data does not exist.",
            }

            return Effect.fail(
              new ResponseError({
                message: messages[error.type] ?? "Something went wrong",
                cause: error,
              })
            )
          },
        })
      )
    )
  )
