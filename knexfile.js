require("dotenv").config({ quiet: true });

/** @type {import("knex").Knex.Config} */
module.exports = {
	client: "mysql2",
	connection: {
		host: process.env.DATABASE_HOST || "localhost",
		port: Number(process.env.DATABASE_PORT || 3306),
		user: process.env.DATABASE_USERNAME || "root",
		password: process.env.DATABASE_PASSWORD || "",
		database: process.env.DATABASE_NAME || "boilerplate",
	},
	pool: {
		min: Number(process.env.DATABASE_POOL_MIN || 2),
		max: Number(process.env.DATABASE_POOL_MAX || 10),
	},
	migrations: {
		directory: "./migrations",
		stub: "./templates/migration.js",
	},
};
