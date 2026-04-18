import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

import { RequestPasswordResetForm } from "@/components/request-password-reset-form"
import { UpdatePasswordForm } from "@/components/update-password-form"

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  const { token } = Route.useSearch()

  if (token) {
    return <UpdatePasswordForm token={token} />
  }

  return <RequestPasswordResetForm />
}
