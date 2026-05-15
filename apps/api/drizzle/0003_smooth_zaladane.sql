ALTER TABLE "requisitions" RENAME COLUMN "requisition_number" TO "name";--> statement-breakpoint
ALTER TABLE "requisitions" DROP CONSTRAINT "requisitions_requisitionNumber_unique";--> statement-breakpoint
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_name_unique" UNIQUE("name");