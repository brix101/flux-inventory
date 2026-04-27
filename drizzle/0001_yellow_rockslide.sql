ALTER TABLE "audit_logs" ALTER COLUMN "action" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "action" DROP NOT NULL;--> statement-breakpoint
DROP TYPE "public"."audit_action";