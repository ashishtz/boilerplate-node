/** @typedef {import('knex/types').Knex} knex */

/**
 *
 * @param {knex} knex
 * @returns
 */
exports.up = (knex) => {
	return knex.schema.createTable("users", (table) => {
		table.increments("id").primary();
		table.string("name", 250).notNullable();
		table.string("email", 250).notNullable();
		table.string("password", 300).notNullable();
		table.string("phone", 10).notNullable();
		table.enu("status", ["active", "inactive", "unverified"]).notNullable().defaultTo("unverified");
		table.enu("role", ["admin", "hr", "user"]).notNullable().defaultTo("user");
		table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
		table.specificType("updatedAt", "timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

		table.index(["email"], "key-email");
		table.unique(["email"], "unique-email");

		table.collate("utf8mb4_unicode_ci");
		table.charset("utf8mb4");
	});
};

/**
 *
 * @param {knex} knex
 * @returns
 */
exports.down = (knex) => {
	return knex.schema.dropTableIfExists("users");
};
