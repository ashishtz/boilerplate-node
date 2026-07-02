import { createApp } from "./app";
import { appConfig } from "./config";
import { closeDatabase } from "./database";
import { logger } from "./providers/logger";

const app = createApp();

const server = app.listen(appConfig.port, () => {
	logger.info(`Server listening on port ${appConfig.port} (${appConfig.env})`);
});

let shuttingDown = false;

/**
 * Graceful shutdown: stop accepting connections, let in-flight requests
 * finish, close the database pool, then exit. A hard deadline guarantees
 * the process never hangs forever on a stuck connection.
 */
const shutdown = (signal: NodeJS.Signals): void => {
	if (shuttingDown) {
		return;
	}
	shuttingDown = true;
	logger.info(`${signal} received, shutting down gracefully`);

	const deadline = setTimeout(() => {
		logger.error("Shutdown deadline exceeded, exiting forcefully");
		process.exit(1);
	}, 10_000);
	deadline.unref();

	server.close((closeError) => {
		void (async () => {
			try {
				await closeDatabase();
			} catch (error) {
				logger.error({ err: error }, "Failed to close the database pool");
			}
			logger.info("Shutdown complete");
			process.exit(closeError ? 1 : 0);
		})();
	});
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason) => {
	logger.fatal({ err: reason }, "Unhandled promise rejection");
	process.exit(1);
});

process.on("uncaughtException", (error) => {
	logger.fatal({ err: error }, "Uncaught exception");
	process.exit(1);
});
