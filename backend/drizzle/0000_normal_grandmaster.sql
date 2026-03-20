CREATE TABLE `questions` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`complexity` text NOT NULL,
	`time` integer NOT NULL,
	`content` text NOT NULL,
	`answer_key` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`username` text NOT NULL,
	`provider` text DEFAULT 'local',
	`created_at` text DEFAULT '2026-03-20T12:13:57.917Z'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);