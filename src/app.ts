import cors, { CorsOptions } from "cors";
import express, { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { appConfig } from "./config";
import authenticate from "./middlewares/authenticate";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import response from "./middlewares/response";
import { logger } from "./providers/logger";
import apiRoutes from "./routes";
import healthRoutes from "./routes/health/routes";

const corsOptions: CorsOptions = {
	origin(origin, callback) {
		// Non-browser clients (curl, server-to-server) send no Origin header.
		if (!origin) {
			return callback(null, true);
		}
		// With no allow-list configured, development stays permissive while
		// production refuses cross-origin browser requests.
		if (!appConfig.allowedOrigins.length) {
			return callback(null, !appConfig.isProduction);
		}
		return callback(null, appConfig.allowedOrigins.includes(origin));
	},
	credentials: true,
};

/**
 * Builds the Express application without binding a port, so tests can
 * exercise it in-process and the bootstrap stays trivial.
 */
export const createApp = (): Express => {
	const app = express();

	app.disable("x-powered-by");
	// Required for correct client IPs (rate limiting!) behind a reverse proxy.
	app.set("trust proxy", appConfig.trustProxy);

	// Response helpers come first: anything failing later in the chain
	// (body parsing included) must already have res.withError available
	// by the time the error handler runs.
	app.use(response);

	app.use(helmet());
	app.use(cors(corsOptions));
	app.use(express.json({ limit: "1mb" }));
	app.use(express.urlencoded({ extended: false, limit: "1mb" }));

	if (!appConfig.isTest) {
		app.use(
			pinoHttp({
				logger,
				autoLogging: { ignore: (req) => (req.url ?? "").startsWith("/health") },
			}),
		);
	}

	app.use(
		rateLimit({
			windowMs: appConfig.rateLimit.windowMs,
			limit: appConfig.rateLimit.max,
			standardHeaders: true,
			legacyHeaders: false,
			handler: (_req, res) => res.withError("TOO_MANY_REQUESTS", 429),
		}),
	);

	app.use(authenticate);

	app.get("/", (_req, res) => {
		res.withData({ name: "boilerplate-node", status: "ok" });
	});
	app.use("/health", healthRoutes);
	app.use("/api", apiRoutes);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
};
