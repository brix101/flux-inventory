import { adminClient, organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { ac, admin, user } from "@/server/auth/permissions"

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        user,
        admin,
      },
    }),
    organizationClient(),
  ],
})
