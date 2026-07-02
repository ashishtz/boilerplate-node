import type { IncomingHttpHeaders } from "node:http";
import type { ParsedQs } from "qs";
import type { AuthUser } from "../../models/User";
import type { SchemaMap } from "../../utils/validate";

/**
 * The request snapshot handed to pre steps and secondary validations.
 * `pre` accumulates the results of earlier pre steps as they complete.
 */
export interface PreRequest {
	body?: Record<string, unknown>;
	params?: Record<string, string | string[] | undefined>;
	query?: ParsedQs;
	user?: AuthUser;
	headers?: IncomingHttpHeaders;
	pre: Record<string, unknown>;
}

/** A single data-fetching step. Its result is stored on `req.pre[assign]`. */
export interface PreStep {
	assign: string;
	method: (req: PreRequest) => unknown | Promise<unknown>;
}

/**
 * Pre steps run sequentially at the top level, so later steps can read
 * the results of earlier ones. Wrap independent steps in a nested array
 * to run that group in parallel (hapi-style).
 */
export type PreDefinition = PreStep | PreDefinition[];

/**
 * A boolean check running after all pre steps completed. Name the check
 * (`assign`) with an i18n message code - it becomes the response message
 * when the check fails.
 */
export interface SecondaryValidation {
	assign: string;
	method: (req: PreRequest) => boolean | Promise<boolean>;
}

/** Joi validator maps per request source. */
export interface ValidationSchemas {
	body?: SchemaMap;
	params?: SchemaMap;
	query?: SchemaMap;
}

export interface PreValidationResult {
	valid: boolean;
	failedCheck?: string;
}

export interface AccessControlOptions {
	validation?: ValidationSchemas;
	pre?: PreDefinition[];
	secondaryValidations?: SecondaryValidation[];
}

export interface XacmlOptions extends AccessControlOptions {
	preRequest: PreRequest;
}
