import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

import { ResetPasswordForm } from "@/components/update-password-form"

const searchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute("/_auth/reset-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  const { token } = Route.useSearch()

  return <ResetPasswordForm token={token} />
}
