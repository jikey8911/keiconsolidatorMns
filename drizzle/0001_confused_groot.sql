CREATE TABLE `system_config` (
	`id` int NOT NULL DEFAULT 1,
	`covalent_api_key_encrypted` text,
	`coingecko_api_key_encrypted` text,
	`is_configured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_id` PRIMARY KEY(`id`)
);
