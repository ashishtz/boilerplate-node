import Joi from "joi";
import { describe, expect, it } from "vitest";
import { Xacml } from "../../src/middlewares/xacml";
import type { PreRequest } from "../../src/middlewares/xacml";

const preRequest = (overrides: Partial<PreRequest> = {}): PreRequest => ({
	body: {},
	params: {},
	query: {},
	headers: {},
	pre: {},
	...overrides,
});

describe("Xacml", () => {
	describe("validateRequest", () => {
		it("collects every validation error across sources", () => {
			const xacml = new Xacml({
				validation: {
					body: { email: Joi.string().email().required(), password: Joi.string().required() },
					params: { id: Joi.number().required() },
				},
				preRequest: preRequest({ body: { email: "not-an-email" }, params: { id: "abc" } }),
			});

			xacml.validateRequest();

			const keys = xacml.validationErrors.map((detail) => detail.context?.key);
			expect(keys).toContain("email");
			expect(keys).toContain("password");
			expect(keys).toContain("id");
		});

		it("passes with valid data", () => {
			const xacml = new Xacml({
				validation: { body: { email: Joi.string().email().required() } },
				preRequest: preRequest({ body: { email: "user@example.com" } }),
			});

			expect(xacml.validateRequest().validationErrors).toHaveLength(0);
		});
	});

	describe("fetchPre", () => {
		it("runs top-level steps sequentially so later steps see earlier results", async () => {
			const xacml = new Xacml({
				pre: [
					{ assign: "first", method: async () => 1 },
					{ assign: "second", method: (req) => (req.pre.first as number) + 1 },
				],
				preRequest: preRequest(),
			});

			await xacml.fetchPre();

			expect(xacml.preRequest.pre).toEqual({ first: 1, second: 2 });
		});

		it("runs nested arrays in parallel", async () => {
			const started: string[] = [];
			const xacml = new Xacml({
				pre: [
					[
						{
							assign: "slow",
							method: async () => {
								started.push("slow");
								await new Promise((resolve) => setTimeout(resolve, 20));
								return "slow-done";
							},
						},
						{
							assign: "fast",
							method: () => {
								started.push("fast");
								return "fast-done";
							},
						},
					],
				],
				preRequest: preRequest(),
			});

			await xacml.fetchPre();

			// Both steps started before the slow one finished.
			expect(started).toEqual(["slow", "fast"]);
			expect(xacml.preRequest.pre).toEqual({ slow: "slow-done", fast: "fast-done" });
		});

		it("stores null for steps returning undefined", async () => {
			const xacml = new Xacml({
				pre: [{ assign: "missing", method: () => undefined }],
				preRequest: preRequest(),
			});

			await xacml.fetchPre();

			expect(xacml.preRequest.pre.missing).toBeNull();
		});
	});

	describe("validatePre", () => {
		it("reports the first failing check by name", async () => {
			const xacml = new Xacml({
				secondaryValidations: [
					{ assign: "PASSING_CHECK", method: () => true },
					{ assign: "EMAIL_ALREADY_EXISTS", method: async () => false },
					{ assign: "NEVER_REACHED", method: () => true },
				],
				preRequest: preRequest(),
			});

			await expect(xacml.validatePre()).resolves.toEqual({
				valid: false,
				failedCheck: "EMAIL_ALREADY_EXISTS",
			});
		});

		it("passes when every check returns true", async () => {
			const xacml = new Xacml({
				secondaryValidations: [
					{ assign: "A", method: () => true },
					{ assign: "B", method: async () => true },
				],
				preRequest: preRequest(),
			});

			await expect(xacml.validatePre()).resolves.toEqual({ valid: true });
		});
	});
});
