CREATE TABLE `forge_auth_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`provider` text NOT NULL,
	`provider_subject` text,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forge_auth_provider_subject_idx` ON `forge_auth_accounts` (`provider`,`provider_subject`);--> statement-breakpoint
CREATE UNIQUE INDEX `forge_auth_provider_email_idx` ON `forge_auth_accounts` (`provider`,`email`);--> statement-breakpoint
CREATE TABLE `forge_auth_attempts` (
	`bucket_hash` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `forge_auth_legacy_links` (
	`account_id` text PRIMARY KEY NOT NULL,
	`legacy_user_id` text NOT NULL,
	`legacy_email` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forge_auth_legacy_user_idx` ON `forge_auth_legacy_links` (`legacy_user_id`);--> statement-breakpoint
CREATE TABLE `forge_auth_oauth` (
	`state_hash` text PRIMARY KEY NOT NULL,
	`nonce` text NOT NULL,
	`verifier` text NOT NULL,
	`return_to` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `forge_auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `forge_auth_session_account_idx` ON `forge_auth_sessions` (`account_id`);
--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_workspaces_insert BEFORE INSERT ON workspaces WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.owner_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_workspaces_update BEFORE UPDATE ON workspaces WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.owner_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_memberships_insert BEFORE INSERT ON memberships WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_memberships_update BEFORE UPDATE ON memberships WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_signature_factors_insert BEFORE INSERT ON signature_factors WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_signature_factors_update BEFORE UPDATE ON signature_factors WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_shared_notes_insert BEFORE INSERT ON shared_notes WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.author_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_blocks_shared_notes_update BEFORE UPDATE ON shared_notes WHEN EXISTS(SELECT 1 FROM forge_auth_legacy_links WHERE account_id=NEW.author_id) BEGIN SELECT RAISE(ABORT,'Linked identity changed; reload before writing'); END;

--> statement-breakpoint
CREATE TRIGGER forge_link_immutable BEFORE UPDATE ON forge_auth_legacy_links BEGIN SELECT RAISE(ABORT,'Identity link is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER forge_link_preserved BEFORE DELETE ON forge_auth_legacy_links BEGIN SELECT RAISE(ABORT,'Identity link requires an explicit audited migration'); END;

--> statement-breakpoint
CREATE TRIGGER forge_verified_member_insert BEFORE INSERT ON memberships WHEN NEW.active=1 AND NEW.user_id LIKE 'forge:%' AND NOT EXISTS(SELECT 1 FROM forge_auth_accounts WHERE id=NEW.user_id AND email_verified=1 AND active=1) AND NOT (NEW.role='owner' AND EXISTS(SELECT 1 FROM workspaces WHERE id=NEW.workspace_id AND owner_id=NEW.user_id)) BEGIN SELECT RAISE(ABORT,'Verified identity required for shared workspace'); END;

--> statement-breakpoint
CREATE TRIGGER forge_verified_grantee_insert BEFORE INSERT ON object_grants WHEN NEW.status='ACTIVE' AND NEW.grantee_id LIKE 'forge:%' AND NOT EXISTS(SELECT 1 FROM forge_auth_accounts WHERE id=NEW.grantee_id AND email_verified=1 AND active=1) BEGIN SELECT RAISE(ABORT,'Verified identity required for shared object'); END;

--> statement-breakpoint
CREATE TRIGGER forge_verified_member_update BEFORE UPDATE ON memberships WHEN NEW.active=1 AND NEW.user_id LIKE 'forge:%' AND NOT EXISTS(SELECT 1 FROM forge_auth_accounts WHERE id=NEW.user_id AND email_verified=1 AND active=1) AND NOT (NEW.role='owner' AND EXISTS(SELECT 1 FROM workspaces WHERE id=NEW.workspace_id AND owner_id=NEW.user_id)) BEGIN SELECT RAISE(ABORT,'Verified identity required for shared workspace'); END;

--> statement-breakpoint
CREATE TRIGGER forge_verified_grantee_update BEFORE UPDATE ON object_grants WHEN NEW.status='ACTIVE' AND NEW.grantee_id LIKE 'forge:%' AND NOT EXISTS(SELECT 1 FROM forge_auth_accounts WHERE id=NEW.grantee_id AND email_verified=1 AND active=1) BEGIN SELECT RAISE(ABORT,'Verified identity required for shared object'); END;
