import { NextFunction, Request, Response } from "express";
import { isApiError } from "../errors";
import { logger } from "../providers/logger";

/** Terminal middleware for unmatched routes. */
export const notFoundHandler = (_req: Request, res: Response): void => {
	res.withError("NOT_FOUND", 404);
};

interface HttpishError {
	status?: unknown;
	statusCode?: unknown;
	type?: unknown;
}

const deriveStatus = (error: unknown): number => {
	const candidate = (error as HttpishError)?.status ?? (error as HttpishError)?.statusCode;
	return typeof candidate === "number" && candidate >= 400 && candidate < 600 ? candidate : 500;
};

/**
 * Central error handler. Express 5 forwards rejected promises from any
 * handler or middleware here automatically, so services can simply throw
 * (usually an ApiError) instead of formatting responses themselves.
 */
export const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
	if (res.headersSent) {
		return next(error);
	}

	if (isApiError(error)) {
		if (error.status >= 500) {
			logger.error({ err: error, path: req.path }, "request failed");
		}
		res.withError(error);
		return;
	}

	// Malformed JSON bodies raise a SyntaxError inside express.json().
	if ((error as HttpishError)?.type === "entity.parse.failed") {
		res.withError("INVALID_JSON", 400);
		return;
	}

	const status = deriveStatus(error);
	if (status >= 500) {
		logger.error({ err: error, path: req.path }, "unhandled error");
	}
	res.withError(error, status);
};
