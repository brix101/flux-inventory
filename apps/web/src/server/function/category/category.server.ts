import * as Effect from "effect/Effect"

import { categories } from "@/server/db/schema"
import { Database } from "@/server/lib/Database"

export function getCategories() {
  return Effect.gen(function* () {
    const db = yield* Database

    return yield* db.use((client) => client.select().from(categories).execute())
  })
}

export function getCategoryById(id: string) {
  return Effect.gen(function* () {
    const db = yield* Database

    return yield* db.use((client) =>
      client.query.categories.findFirst({
        where: (tbl, { eq }) => eq(tbl.id, id),
      })
    )
  })
}
