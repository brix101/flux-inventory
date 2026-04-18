import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"

export const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete"], // <-- Permissions available for created roles
  // manager: ["*"], // <-- Super admin has access to all permissions without needing them to be specified
} as const

export const ac = createAccessControl(statement)

export const user = ac.newRole({
  project: ["create"],
})

export const manager = ac.newRole({
  project: ["create", "update"],
  user: ["list", "create", "update"],
})

export const admin = ac.newRole({
  project: ["create", "update", "delete"],
  ...adminAc.statements,
})
