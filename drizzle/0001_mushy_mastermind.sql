CREATE TABLE `keyword` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keyword_name_unique` ON `keyword` (`name`);--> statement-breakpoint
CREATE TABLE `unit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`movement` integer NOT NULL,
	`toughness` integer NOT NULL,
	`save` integer NOT NULL,
	`wounds` integer NOT NULL,
	`leadership` text NOT NULL,
	`objective_control` integer NOT NULL,
	`invulnerability_save` integer NOT NULL,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unit_slug_unique` ON `unit` (`slug`);--> statement-breakpoint
CREATE TABLE `unit_keyword` (
	`unit_id` integer NOT NULL,
	`keyword_id` integer NOT NULL,
	PRIMARY KEY(`unit_id`, `keyword_id`),
	FOREIGN KEY (`unit_id`) REFERENCES `unit`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`keyword_id`) REFERENCES `keyword`(`id`) ON UPDATE no action ON DELETE no action
);
