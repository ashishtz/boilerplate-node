/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = (knex) => {
	return knex.schema.createTable("tableName", (table) => {
		table.increments("id").primary();
	});
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = (knex) => {
	return knex.schema.dropTableIfExists("tableName");
};
