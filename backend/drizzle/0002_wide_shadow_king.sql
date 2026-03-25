PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_quiz_results` (
	`complexity` text NOT NULL,
	`created_at` text,
	`details` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_duration` integer NOT NULL,
	`total_score` integer NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_quiz_results`("complexity", "created_at", "details", "id", "total_duration", "total_score", "user_id") SELECT "complexity", "created_at", "details", "id", "total_duration", "total_score", "user_id" FROM `quiz_results`;--> statement-breakpoint
DROP TABLE `quiz_results`;--> statement-breakpoint
ALTER TABLE `__new_quiz_results` RENAME TO `quiz_results`;--> statement-breakpoint
PRAGMA foreign_keys=ON;