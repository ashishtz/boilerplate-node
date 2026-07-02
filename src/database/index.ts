import knexFactory, { Knex } from "knex";
import { Model } from "objection";
import { appConfig, dbConfig } from "../config";
import { logger } from "../providers/logger";

export const knex: Knex = knexFactory(dbConfig);

// Bind the knex instance to Objection so every model can run queries.
Model.knex(knex);

interface TrackedQuery {
	__knexQueryUid: string;
	sql: string;
	bindings?: unknown[];
}

/**
 * Logs every executed query with its duration at debug level. Enable it
 * with ENABLE_QUERY_LOG=true (and LOG_LEVEL=debug or lower).
 */
const attachQueryLogger = (instance: Knex): void => {
	const pending = new Map<string, number>();

	instance
		.on("query", (query: TrackedQuery) => {
			pending.set(query.__knexQueryUid, performance.now());
		})
		.on("query-response", (_response: unknown, query: TrackedQuery) => {
			const startedAt = pending.get(query.__knexQueryUid);
			pending.delete(query.__knexQueryUid);
			logger.debug(
				{
					sql: query.sql,
					bindings: query.bindings,
					durationMs:
						startedAt === undefined ? undefined : Number((performance.now() - startedAt).toFixed(1)),
				},
				"db query",
			);
		})
		.on("query-error", (error: unknown, query: TrackedQuery) => {
			pending.delete(query.__knexQueryUid);
			logger.error({ err: error, sql: query.sql }, "db query failed");
		});
};

if (appConfig.enableQueryLog) {
	attachQueryLogger(knex);
}

/** Lightweight connectivity probe used by the readiness endpoint. */
export const checkDatabaseConnection = async (): Promise<void> => {
	await knex.raw("select 1");
};

/** Closes the connection pool. Called during graceful shutdown. */
export const closeDatabase = (): Promise<void> => knex.destroy();
