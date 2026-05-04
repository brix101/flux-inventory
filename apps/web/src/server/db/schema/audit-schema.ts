import { relations } from "drizzle-orm"
import { index, pgTable } from "drizzle-orm/pg-core"

import { users } from "./auth-schema"

// ===========================================================================
// AUDIT LOGS
// ===========================================================================

export const auditLogs = pgTable(
  "audit_logs",
  (t) => ({
    id: t.uuid().notNull().defaultRandom().primaryKey(),

    userId: t.text().references(() => users.id, { onDelete: "set null" }),
    action: t.text(),

    entityName: t.varchar({ length: 100 }).notNull(),
    entityId: t.uuid().notNull(),

    oldValue: t.jsonb(),
    newValue: t.jsonb(),
    metadata: t.jsonb(),

    createdAt: t.timestamp().defaultNow().notNull(),
  }),
  (t) => [
    index("idx_audit_logs_user_id").on(t.userId),
    index("idx_audit_logs_entity").on(t.entityName, t.entityId),
    index("idx_audit_logs_created_at").on(t.createdAt),
  ]
)

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}))

export type AuditLogs = typeof auditLogs.$inferSelect
