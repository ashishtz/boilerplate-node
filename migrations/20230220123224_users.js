/**
 * The status and role enums must stay in sync with src/constants.
 *
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = (knex) => {
	return knex.schema.createTable("users", (table) => {
		table.increments("id").primary();
		table.string("name", 250).notNullable();
		table.string("email", 250).notNullable();
		table.string("password", 300).notNullable();
		table.string("phone", 20).notNullable();
		table.enu("status", ["active", "inactive", "unverified"]).notNullable().defaultTo("unverified");
		table.enu("role", ["admin", "user"]).notNullable().defaultTo("user");
		table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
		table.specificType("updatedAt", "timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

		table.unique(["email"], "unique-email");

		table.collate("utf8mb4_unicode_ci");
		table.charset("utf8mb4");
	});
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = (knex) => {
	return knex.schema.dropTableIfExists("users");
};
