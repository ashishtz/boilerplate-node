import Bluebird from "bluebird";
import { Request } from "express";
import { ValidationError } from "joi";
import { Pre, ValidationObj, SecondaryValidation, PreValidation, Construct } from "./types";

class XacmlClass {
	pre: Pre[] = [];
	validation: ValidationObj = {};
	secondaryValidations: SecondaryValidation[] = [];
	validationErrors: ValidationError["details"] = [];
	preRequest: Partial<Request> = { pre: {} };
	preValidations: PreValidation = {};

	constructor({
		pre, validation, secondaryValidations, preRequest 
	}: Construct) {
		this.pre = pre!;
		this.validation = validation;
		this.secondaryValidations = secondaryValidations!;
		this.preRequest = preRequest;
	}

	async deepFetch(pre: Pre | Pre[]) {
		if (Array.isArray(pre)) {
			const data: unknown[] = await Bluebird.all(pre.map((inner) => this.deepFetch(inner)));
			return data;
		}

		const method: unknown = await pre.method(this.preRequest);
		(this.preRequest.pre || {})[pre.assign] = method ? JSON.parse(JSON.stringify(method)) : null;
		return method;
	}

	async fetchPre() {
		await this.deepFetch(this.pre);
		return this;
	}

	async validatePre() {
		const preValidations = this.secondaryValidations.reduce<{ valid: boolean; stack: string }>(
			(acc, validation) => {
				const isValid = validation.method(this.preRequest);
				if (!acc.valid) {
					return acc;
				}
				return {
					valid : acc.valid ? isValid : acc.valid,
					stack : validation.assign,
				};
			},
			{
				valid : true,
				stack : "",
			}
		) as PreValidation;

		this.preValidations = preValidations;

		return this;
	}

	validateRequest(request: Partial<Request>) {
		const keys = Object.keys(this.validation) as Array<"body" | "params" | "query">;

		const validationErrors = keys.reduce<ValidationError["details"]>((acc, key) => {
			const { error } = request.validate!(request[key], this.validation[key]);
			if (error) {
				return [...acc, ...error.details];
			}
			return acc;
		}, []);

		this.validationErrors = validationErrors;
		return this;
	}
}

export default XacmlClass;
