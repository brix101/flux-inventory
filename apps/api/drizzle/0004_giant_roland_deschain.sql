ALTER TABLE "purchase_order_items" RENAME COLUMN "quantity_ordered" TO "order_qty";--> statement-breakpoint
ALTER TABLE "purchase_order_items" RENAME COLUMN "quantity_received" TO "received_qty";--> statement-breakpoint
ALTER TABLE "requisition_items" RENAME COLUMN "quantity_requested" TO "request_qty";--> statement-breakpoint
ALTER TABLE "requisition_items" RENAME COLUMN "quantity_approved" TO "approved_qty";