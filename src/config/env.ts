import path from "node:path";
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

/** Matches jsonwebtoken/ms style durations such as "15m", "7d" or "1y". */
const EXPIRY_PATTERN = /^\d+(ms|s|m|h|d|w|y)$/;

const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;
const NODE_ENVS = ["development", "test", "production"] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];
export type LogLevel = (typeof LOG_LEVELS)[number];

const envSchema = Joi.object({
	NODE_ENV: Joi.string()
		.valid(...NODE_ENVS)
		.default("development"),
	PORT: Joi.number().port().default(4200),
	SERVER_URL: Joi.string().uri().default("http://localhost:4200"),
	ALLOWED_ORIGINS: Joi.string().allow("").default(""),
	TRUST_PROXY: Joi.boolean().default(false),

	LOG_LEVEL: Joi.string()
		.valid(...LOG_LEVELS)
		.default("info"),
	ENABLE_QUERY_LOG: Joi.boolean().default(false),

	DATABASE_HOST: Joi.string().default("localhost"),
	DATABASE_PORT: Joi.number().port().default(3306),
	DATABASE_USERNAME: Joi.string().default("root"),
	DATABASE_PASSWORD: Joi.string().allow("").default(""),
	DATABASE_NAME: Joi.string().default("boilerplate"),
	DATABASE_POOL_MIN: Joi.number().integer().min(0).default(2),
	DATABASE_POOL_MAX: Joi.number().integer().min(1).default(10),

	AUTH_TOKEN_EXPIRY: Joi.string().pattern(EXPIRY_PATTERN).default("7d"),
	REMEMBER_TOKEN_EXPIRY: Joi.string().pattern(EXPIRY_PATTERN).default("30d"),
	JWT_PASSPHRASE: Joi.string().default("local-development-passphrase"),
	JWT_PRIVATE_KEY_PATH: Joi.string().default("keys/private.pem"),
	JWT_PUBLIC_KEY_PATH: Joi.string().default("keys/public.pem"),
	MAIL_TOKEN_SECRET: Joi.string().default("local-development-mail-token-secret"),
	BCRYPT_SALT_ROUNDS: Joi.number().integer().min(4).max(31).default(12),

	RATE_LIMIT_WINDOW_MS: Joi.number()
		.integer()
		.min(1000)
		.default(15 * 60 * 1000),
	RATE_LIMIT_MAX: Joi.number().integer().min(1).default(100),
	AUTH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(10),
}).unknown(true);

const { value, error } = envSchema.validate(process.env, { abortEarly: false, convert: true });

if (error) {
	const details = error.details.map((detail) => detail.message).join("\n  - ");
	throw new Error(`Environment validation failed:\n  - ${details}`);
}

// Secrets and connection details must be provided explicitly in production;
// the schema defaults above are for local development and tests only.
if (value.NODE_ENV === "production") {
	const requiredInProduction = [
		"DATABASE_HOST",
		"DATABASE_USERNAME",
		"DATABASE_PASSWORD",
		"DATABASE_NAME",
		"JWT_PASSPHRASE",
		"MAIL_TOKEN_SECRET",
	];
	const missing = requiredInProduction.filter((key) => !process.env[key]);
	if (missing.length) {
		throw new Error(`Missing required environment variables in production: ${missing.join(", ")}`);
	}
}

export interface Env {
	nodeEnv: NodeEnv;
	port: number;
	serverUrl: string;
	allowedOrigins: string[];
	trustProxy: boolean;
	logLevel: LogLevel;
	enableQueryLog: boolean;
	databaseHost: string;
	databasePort: number;
	databaseUsername: string;
	databasePassword: string;
	databaseName: string;
	databasePoolMin: number;
	databasePoolMax: number;
	authTokenExpiry: string;
	rememberTokenExpiry: string;
	jwtPassphrase: string;
	jwtPrivateKeyPath: string;
	jwtPublicKeyPath: string;
	mailTokenSecret: string;
	bcryptSaltRounds: number;
	rateLimitWindowMs: number;
	rateLimitMax: number;
	authRateLimitMax: number;
}

export const env: Env = {
	nodeEnv: value.NODE_ENV,
	port: value.PORT,
	serverUrl: value.SERVER_URL,
	allowedOrigins: String(value.ALLOWED_ORIGINS)
		.split(",")
		.map((origin: string) => origin.trim())
		.filter(Boolean),
	trustProxy: value.TRUST_PROXY,
	logLevel: value.LOG_LEVEL,
	enableQueryLog: value.ENABLE_QUERY_LOG,
	databaseHost: value.DATABASE_HOST,
	databasePort: value.DATABASE_PORT,
	databaseUsername: value.DATABASE_USERNAME,
	databasePassword: value.DATABASE_PASSWORD,
	databaseName: value.DATABASE_NAME,
	databasePoolMin: value.DATABASE_POOL_MIN,
	databasePoolMax: value.DATABASE_POOL_MAX,
	authTokenExpiry: value.AUTH_TOKEN_EXPIRY,
	rememberTokenExpiry: value.REMEMBER_TOKEN_EXPIRY,
	jwtPassphrase: value.JWT_PASSPHRASE,
	jwtPrivateKeyPath: value.JWT_PRIVATE_KEY_PATH,
	jwtPublicKeyPath: value.JWT_PUBLIC_KEY_PATH,
	mailTokenSecret: value.MAIL_TOKEN_SECRET,
	bcryptSaltRounds: value.BCRYPT_SALT_ROUNDS,
	rateLimitWindowMs: value.RATE_LIMIT_WINDOW_MS,
	rateLimitMax: value.RATE_LIMIT_MAX,
	authRateLimitMax: value.AUTH_RATE_LIMIT_MAX,
};
