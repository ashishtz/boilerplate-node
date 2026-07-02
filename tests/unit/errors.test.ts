import { describe, expect, it } from "vitest";
import { ApiError, isApiError } from "../../src/errors";

describe("ApiError", () => {
	it("carries status, code and optional details", () => {
		const error = new ApiError(409, "EMAIL_ALREADY_EXISTS", { details: { email: "a@b.c" } });

		expect(error).toBeInstanceOf(Error);
		expect(error.status).toBe(409);
		expect(error.code).toBe("EMAIL_ALREADY_EXISTS");
		expect(error.details).toEqual({ email: "a@b.c" });
	});

	it("exposes convenient factories", () => {
		expect(ApiError.unauthorized("INVALID_CREDENTIALS").status).toBe(401);
		expect(ApiError.forbidden().status).toBe(403);
		expect(ApiError.notFound().status).toBe(404);
		expect(ApiError.conflict().status).toBe(409);
		expect(ApiError.badRequest().status).toBe(400);
		expect(ApiError.internal().status).toBe(500);
	});

	it("is detected by the type guard", () => {
		expect(isApiError(ApiError.notFound())).toBe(true);
		expect(isApiError(new Error("boom"))).toBe(false);
		expect(isApiError("nope")).toBe(false);
	});
});
