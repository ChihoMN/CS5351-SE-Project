ALTER TABLE "tasks" ADD COLUMN "priority" text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "due_date" integer;