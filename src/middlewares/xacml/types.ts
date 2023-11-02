import { IncomingHttpHeaders } from "http2";
import { ParsedQs } from "qs";
import Objection from "objection";
import { Request } from "express";
export type PreWithData = {
	pre: {
		[key: string]: unknown;
	};
	params?: { [key: string]: string };
	body?: { [key: string]: string };
	query?: ParsedQs;
	user?: {
		id: number;
		role: "admin" | "hr" | "interviewer";
		email: string;
		status: "active" | "inactive" | "unverified";
	};
	headers?: IncomingHttpHeaders;
};

export type Pre = {
	assign: string;
	method: (methods: Partial<Request>) => Objection.QueryBuilder<Objection.Model> | unknown;
};

export type SecondaryValidation = {
	assign: string;
	method: (methods: Partial<Request>) => boolean;
};

export type JoiValidationData = { [key: string]: unknown };

export type ValidationObj = {
	body?: JoiValidationData | JoiValidationData[];
	params?: JoiValidationData | JoiValidationData[];
	query?: JoiValidationData | JoiValidationData[];
};

export type PreValidation = {
	valid?: boolean;
	stack?: string;
};

export interface Construct {
	pre?: Pre[];
	validation: ValidationObj;
	secondaryValidations?: SecondaryValidation[];
	preRequest: Partial<Request>;
}
