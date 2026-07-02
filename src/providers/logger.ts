import pino from "pino";
import { appConfig } from "../config";

/**
 * Application wide structured logger. Logs JSON in production (machine
 * readable, works with any log collector) and pretty prints during local
 * development.
 */
export const logger = pino({
	level: appConfig.logLevel,
	...(appConfig.isDevelopment
		? {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "SYS:standard",
						ignore: "pid,hostname",
					},
				},
			}
		: {}),
});

export default logger;
