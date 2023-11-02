import Joi, { ValidationError, ValidationResult } from "joi";

// to make the file a module and avoid the TypeScript error
export {};

type JoiValidationData = { [key: string]: unknown };

type ErrorMessage = {
	status: number;
	message: string;
	stack: string;
	statusCode: number;
};

declare global {
	namespace Express {
		export interface Request {
			user?: {
				id: number;
				role: "admin" | "hr" | "user";
				email: string;
				status: "active" | "inactive" | "unverified";
			};
			validate: (data: JoiValidationData | JoiValidationData[], validationObject: Joi) => ValidationResult;
			pre?: Record<unknown>;
		}
		export interface Response {
			withData: (data: unknown, message: string, statusCode: number) => void;
			withError: (message: ErrorMessage | string | unknown, statusCode: number, data?: unknown) => void;
			withValidation: (data: ValidationError["details"]) => void;
		}
	}
}
