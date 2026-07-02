import type { ValidationErrorItem, ValidationResult } from "joi";
import type { AuthUser } from "../../models/User";
import type { SchemaMap } from "../../utils/validate";

declare global {
	namespace Express {
		interface Request {
			/** Authenticated user, populated by the authenticate middleware when a valid bearer token is present. */
			user?: AuthUser;
			/** Data fetched by XACML pre steps, keyed by each step's `assign` name. */
			pre?: Record<string, unknown>;
			/** Validates a payload against a map of Joi validators, collecting all errors. */
			validate: (data: unknown, schemaMap: SchemaMap) => ValidationResult;
		}

		interface Response {
			/** Sends the standard success envelope: `{ data, message, status }`. */
			withData: (data?: unknown, message?: string, status?: number) => Response;
			/** Sends the standard error envelope. Accepts a message code, an ApiError or any thrown value. */
			withError: (error: unknown, status?: number) => Response;
			/** Sends a 422 envelope listing every failed validation, keyed by field. */
			withValidation: (details: ValidationErrorItem[]) => Response;
		}
	}
}

export {};
