CREATE TABLE `admin_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_user_username_unique` ON `admin_user` (`username`);--> statement-breakpoint
CREATE TABLE `keyword` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keyword_name_unique` ON `keyword` (`name`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`csrf_token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_session_id_unique` ON `session` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_session_expires_at` ON `session` (`expires_at`);--> statement-breakpoint
CREATE TABLE `unit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`movement` integer NOT NULL,
	`toughness` integer NOT NULL,
	`save` integer NOT NULL,
	`wounds` integer NOT NULL,
	`leadership` integer NOT NULL,
	`objective_control` integer NOT NULL,
	`invulnerability_save` integer,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unit_slug_unique` ON `unit` (`slug`);--> statement-breakpoint
CREATE TABLE `unit_keyword` (
	`unit_id` integer NOT NULL,
	`keyword_id` integer NOT NULL,
	PRIMARY KEY(`unit_id`, `keyword_id`),
	FOREIGN KEY (`unit_id`) REFERENCES `unit`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`keyword_id`) REFERENCES `keyword`(`id`) ON UPDATE no action ON DELETE cascade
);
