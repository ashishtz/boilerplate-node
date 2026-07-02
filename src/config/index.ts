import type { Knex } from "knex";
import { env } from "./env";

export { env } from "./env";
export type { Env, LogLevel, NodeEnv } from "./env";

export const appConfig = {
	env: env.nodeEnv,
	isProduction: env.nodeEnv === "production",
	isDevelopment: env.nodeEnv === "development",
	isTest: env.nodeEnv === "test",
	port: env.port,
	serverUrl: env.serverUrl,
	allowedOrigins: env.allowedOrigins,
	trustProxy: env.trustProxy,
	logLevel: env.logLevel,
	enableQueryLog: env.enableQueryLog,
	rateLimit: {
		windowMs: env.rateLimitWindowMs,
		max: env.rateLimitMax,
		authMax: env.authRateLimitMax,
	},
} as const;

export const dbConfig: Knex.Config = {
	client: "mysql2",
	connection: {
		host: env.databaseHost,
		port: env.databasePort,
		user: env.databaseUsername,
		password: env.databasePassword,
		database: env.databaseName,
	},
	pool: {
		min: env.databasePoolMin,
		max: env.databasePoolMax,
	},
};

export const authConfig = {
	authTokenExpiry: env.authTokenExpiry,
	rememberTokenExpiry: env.rememberTokenExpiry,
	jwtPassphrase: env.jwtPassphrase,
	privateKeyPath: env.jwtPrivateKeyPath,
	publicKeyPath: env.jwtPublicKeyPath,
	mailTokenSecret: env.mailTokenSecret,
	bcryptSaltRounds: env.bcryptSaltRounds,
} as const;
