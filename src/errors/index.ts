/**
 * Application error carrying an HTTP status and an i18n message code.
 * Throw it anywhere inside a route handler or middleware; the central
 * error handler translates it into the standard response envelope.
 */
export class ApiError extends Error {
	readonly status: number;
	readonly code: string;
	readonly details?: unknown;

	constructor(status: number, code: string, options: { details?: unknown; cause?: unknown } = {}) {
		super(code, options.cause ? { cause: options.cause } : undefined);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.details = options.details;
	}

	static badRequest(code = "BAD_REQUEST", details?: unknown) {
		return new ApiError(400, code, { details });
	}

	static unauthorized(code = "NOT_AUTHENTICATED", details?: unknown) {
		return new ApiError(401, code, { details });
	}

	static forbidden(code = "NOT_AUTHORIZED", details?: unknown) {
		return new ApiError(403, code, { details });
	}

	static notFound(code = "NOT_FOUND", details?: unknown) {
		return new ApiError(404, code, { details });
	}

	static conflict(code = "CONFLICT", details?: unknown) {
		return new ApiError(409, code, { details });
	}

	static internal(code = "GENERAL_ERROR", details?: unknown) {
		return new ApiError(500, code, { details });
	}
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
