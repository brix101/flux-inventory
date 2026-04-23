import { createFileRoute } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import z from "zod"

import { auth } from "@/server/auth"
import { db } from "@/server/db"
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
      POST: async ({ params, request }) => {
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

              const res = await auth.api.createUser({
                body: {
                  ...data,
                  role: "admin",
                },
              })

              await db
                .update(users)
                .set({ emailVerified: true })
                .where(eq(users.id, res.user.id))

              return new Response(
                JSON.stringify({
                  ...res.user,
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
