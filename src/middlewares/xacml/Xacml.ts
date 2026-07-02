import type { ValidationErrorItem } from "joi";
import { validate } from "../../utils/validate";
import type {
	PreDefinition,
	PreRequest,
	PreStep,
	PreValidationResult,
	SecondaryValidation,
	ValidationSchemas,
	XacmlOptions,
} from "./types";

const VALIDATION_SOURCES = ["body", "params", "query"] as const;

/**
 * Orchestrates the three XACML phases for a request:
 *
 * 1. `validateRequest` - Joi validation of body/params/query.
 * 2. `fetchPre`        - data fetching steps, sequential at the top level
 *                        (later steps can use earlier results via
 *                        `req.pre`), parallel inside nested arrays.
 * 3. `validatePre`     - boolean checks over the fetched data; the first
 *                        failing check short-circuits the chain.
 */
class Xacml {
	private readonly pre: PreDefinition[];
	private readonly validation?: ValidationSchemas;
	private readonly secondaryValidations: SecondaryValidation[];
	readonly preRequest: PreRequest;
	validationErrors: ValidationErrorItem[] = [];

	constructor({ pre = [], validation, secondaryValidations = [], preRequest }: XacmlOptions) {
		this.pre = pre;
		this.validation = validation;
		this.secondaryValidations = secondaryValidations;
		this.preRequest = preRequest;
	}

	validateRequest(): this {
		this.validationErrors = VALIDATION_SOURCES.flatMap((source) => {
			const schemaMap = this.validation?.[source];
			if (!schemaMap) {
				return [];
			}
			const { error } = validate(this.preRequest[source], schemaMap);
			return error ? error.details : [];
		});
		return this;
	}

	async fetchPre(): Promise<this> {
		await this.runSequential(this.pre);
		return this;
	}

	async validatePre(): Promise<PreValidationResult> {
		for (const check of this.secondaryValidations) {
			const valid = await check.method(this.preRequest);
			if (!valid) {
				return { valid: false, failedCheck: check.assign };
			}
		}
		return { valid: true };
	}

	private async runSequential(steps: PreDefinition[]): Promise<void> {
		for (const step of steps) {
			if (Array.isArray(step)) {
				await this.runParallel(step);
			} else {
				await this.runStep(step);
			}
		}
	}

	private async runParallel(steps: PreDefinition[]): Promise<void> {
		await Promise.all(steps.map((step) => (Array.isArray(step) ? this.runSequential(step) : this.runStep(step))));
	}

	private async runStep(step: PreStep): Promise<void> {
		const result = await step.method(this.preRequest);
		this.preRequest.pre[step.assign] = result ?? null;
	}
}

export default Xacml;
