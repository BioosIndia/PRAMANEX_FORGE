CREATE TABLE `object_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`object_type` text NOT NULL,
	`object_id` text NOT NULL,
	`object_revision` text NOT NULL,
	`grantee_id` text NOT NULL,
	`permissions` text NOT NULL,
	`allow_original` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`granted_by` text NOT NULL,
	`reason` text NOT NULL,
	`permission_basis` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`revoked_at` text
);
--> statement-breakpoint
CREATE INDEX `grants_workspace_grantee` ON `object_grants` (`workspace_id`,`grantee_id`,`status`);--> statement-breakpoint
CREATE INDEX `grants_workspace_object` ON `object_grants` (`workspace_id`,`object_type`,`object_id`);--> statement-breakpoint
CREATE TABLE `runtime_events` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`job_id` text,
	`action` text NOT NULL,
	`actor_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `runtime_events_workflow` ON `runtime_events` (`workflow_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `runtime_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`generation` integer NOT NULL,
	`node_key` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`depends_on` text NOT NULL,
	`payload` text NOT NULL,
	`input_revision` integer,
	`input_hash` text,
	`source_refs` text NOT NULL,
	`attempts` integer NOT NULL,
	`available_at` integer NOT NULL,
	`lease_token` text,
	`lease_until` integer,
	`version` integer NOT NULL,
	`output` text,
	`failure` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `runtime_workflows`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `runtime_job_node` ON `runtime_jobs` (`workflow_id`,`generation`,`node_key`);--> statement-breakpoint
CREATE INDEX `runtime_jobs_ready` ON `runtime_jobs` (`status`,`available_at`,`lease_until`);--> statement-breakpoint
CREATE TABLE `runtime_workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`created_by` text NOT NULL,
	`op_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`goal` text NOT NULL,
	`status` text NOT NULL,
	`generation` integer NOT NULL,
	`version` integer NOT NULL,
	`cursor_revision` integer NOT NULL,
	`cursor_hash` text NOT NULL,
	`config` text NOT NULL,
	`pause_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `runtime_workflow_operation` ON `runtime_workflows` (`workspace_id`,`created_by`,`op_key`);--> statement-breakpoint
CREATE INDEX `runtime_workflow_workspace` ON `runtime_workflows` (`workspace_id`,`status`);--> statement-breakpoint
CREATE TABLE `shared_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`grant_id` text,
	`object_type` text NOT NULL,
	`object_id` text NOT NULL,
	`object_revision` text NOT NULL,
	`author_id` text NOT NULL,
	`kind` text NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notes_workspace_object` ON `shared_notes` (`workspace_id`,`object_type`,`object_id`);