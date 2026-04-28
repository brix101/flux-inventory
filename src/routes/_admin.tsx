import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from "@tanstack/react-router"

import { getSession } from "@/server/function/auth/auth.functions"

export const Route = createFileRoute("/_admin")({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: "/login",
      })
    }

    const roles = session.user.role.split(",")

    if (!roles.includes("manager")) {
      throw notFound()
    }

    return { user: session.user }
  },
  component: () => <Outlet />,
})
