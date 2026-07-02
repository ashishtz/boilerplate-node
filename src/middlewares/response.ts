import { NextFunction, Request, Response } from "express";
import type { ValidationErrorItem } from "joi";
import { appConfig } from "../config";
import { isApiError } from "../errors";
import { transform } from "../i18n";
import { validate } from "../utils/validate";

/**
 * Extends every request/response with the boilerplate's helpers so all
 * endpoints answer with the same envelope: `{ data?, message, status }`.
 * Must be registered before any route or error handler that uses them.
 */
export default (req: Request, res: Response, next: NextFunction): void => {
	res.withData = (data = null, message = "SUCCESS", status = 200) =>
		res.status(status).send({
			data,
			message: transform(message),
			status,
		});

	res.withValidation = (details: ValidationErrorItem[] = []) => {
		const errors = details.map((item, index) => ({
			[String(item.context?.key ?? index)]: item.message,
		}));
		return res.status(422).send({
			data: errors,
			message: transform("VALIDATION_FAILED"),
			status: 422,
		});
	};

	res.withError = (error, status = 500) => {
		let responseStatus = status;
		let code = "GENERAL_ERROR";
		let stack: string | undefined;

		if (typeof error === "string") {
			code = error;
		} else if (isApiError(error)) {
			responseStatus = error.status;
			code = error.code;
			stack = error.stack;
		} else if (error instanceof Error) {
			code = error.message;
			stack = error.stack;
		}

		// Never leak internals in production: unexpected 5xx details are
		// replaced by a generic message and stacks are only sent in development.
		if (appConfig.isProduction && responseStatus >= 500) {
			code = "GENERAL_ERROR";
		}

		return res.status(responseStatus).send({
			message: transform(code),
			status: responseStatus,
			stack: appConfig.isDevelopment ? stack : undefined,
		});
	};

	req.validate = (data, schemaMap) => validate(data, schemaMap);

	next();
};
