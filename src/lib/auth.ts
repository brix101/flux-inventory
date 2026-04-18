import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin as adminPlugin, organization } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import { db } from "@/db"

import { ac, admin, manager, user } from "./permissions"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    sendResetPassword: async ({ user: { email }, url, token }) => {
      const parsed = new URL(url)
      const baseUrl = parsed.origin

      const resetLink = `${baseUrl}/reset-password?token=${token}`

      console.log({
        to: email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${resetLink}`,
      })
      console.log(resetLink)
      // void sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   text: `Click the link to reset your password: ${url}`,
      // });
    },
  },
  plugins: [
    tanstackStartCookies(),
    adminPlugin({
      ac,
      roles: {
        user,
        admin,
        manager,
      },
      adminRoles: ["admin", "manager"],
    }),
    organization(),
  ],
})
