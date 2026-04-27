import { createFileRoute } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import * as Effect from "effect/Effect"
import z from "zod"

import { Auth } from "@/server/auth"
import { Database } from "@/server/db"
import { users } from "@/server/db/schema"

const secretKey = process.env.ROUTE_SECRET

const defaultUserSchema = z.object({
  name: z.string().default("Admin User"),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const Route = createFileRoute("/api/initial/$")({
  server: {
    handlers: {
      POST: async ({ params, request, context: { runEffect } }) => {
        const { _splat } = params

        switch (_splat) {
          case "user": {
            const authToken = request.headers.get("X-Flux-Token")
            if (!authToken) {
              return new Response("Unauthorized", { status: 401 })
            }

            if (authToken !== secretKey) {
              return new Response("Forbidden", { status: 403 })
            }

            try {
              const body = await request.json()
              const { data, success, error } = defaultUserSchema.safeParse(body)
              if (!success) {
                return new Response(
                  JSON.stringify(z.treeifyError(error).properties),
                  {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                  }
                )
              }

              const user = await runEffect(
                Effect.gen(function* () {
                  const auth = yield* Auth
                  const db = yield* Database

                  const result = yield* auth.use((api) =>
                    api.createUser({
                      body: {
                        ...data,
                        role: "admin",
                      },
                    })
                  )

                  yield* db.use((client) =>
                    client
                      .update(users)
                      .set({ emailVerified: true })
                      .where(eq(users.id, result.user.id))
                  )

                  return result.user
                })
              )

              return new Response(
                JSON.stringify({
                  ...user,
                  emailVerified: true,
                }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                }
              )
            } catch (error) {
              console.error("Error creating initial user:", error)
              return new Response("Failed to create initial user", {
                status: 500,
              })
            }
          }
          default: {
            return new Response("Not Found", { status: 404 })
          }
        }
      },
    },
  },
})
