CREATE TABLE `forge_work_samples` (
	`id` text PRIMARY KEY NOT NULL,
	`fixture_version` text NOT NULL,
	`payload` text NOT NULL,
	`hash` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER forge_work_samples_no_update BEFORE UPDATE ON forge_work_samples BEGIN SELECT RAISE(ABORT, 'Saved synthetic proof is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER forge_work_samples_no_delete BEFORE DELETE ON forge_work_samples BEGIN SELECT RAISE(ABORT, 'Saved synthetic proof is immutable'); END;
