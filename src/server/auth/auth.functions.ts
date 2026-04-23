import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/server/auth"

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    return session
  }
)

export const ensureSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error("Unauthorized")
    }

    return session
  }
)

export const getPermissions = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error("Unauthorized")
    }

    const { success } = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        role: "manager",
        permissions: {
          // manager: ["*"],
        },
      },
    })

    if (!success) {
      throw new Error("Error checking permissions")
    }

    return { ...session, hasPermission: success }
  }
)
