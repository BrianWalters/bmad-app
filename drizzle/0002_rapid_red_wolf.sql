CREATE TABLE `equipment_option` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`range` integer DEFAULT 0 NOT NULL,
	`attacks` integer NOT NULL,
	`skill` integer NOT NULL,
	`strength` integer NOT NULL,
	`armor_piercing` integer DEFAULT 0 NOT NULL,
	`damage_min` integer DEFAULT 1 NOT NULL,
	`damage_max` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `model_equipment_option` (
	`model_id` integer NOT NULL,
	`equipment_option_id` integer NOT NULL,
	`is_default` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`model_id`, `equipment_option_id`),
	FOREIGN KEY (`model_id`) REFERENCES `model`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`equipment_option_id`) REFERENCES `equipment_option`(`id`) ON UPDATE no action ON DELETE cascade
);
