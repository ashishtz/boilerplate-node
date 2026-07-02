import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { extractBearerToken, signAuthToken, verifyAuthToken } from "../../src/providers/jwt";

const requestWithAuth = (authorization?: string): Request =>
	({ headers: authorization ? { authorization } : {} }) as Request;

describe("jwt provider", () => {
	it("signs and verifies a token round-trip", () => {
		const token = signAuthToken({ id: 42, role: "admin" });
		const payload = verifyAuthToken(token);

		expect(payload).not.toBeNull();
		expect(payload?.sub).toBe("42");
		expect(payload?.role).toBe("admin");
		expect(payload?.exp).toBeGreaterThan(Date.now() / 1000);
	});

	it("rejects tampered tokens", () => {
		const token = signAuthToken({ id: 1, role: "user" });
		const [header, payload] = token.split(".");
		const forged = `${header}.${payload}.forgedsignature`;

		expect(verifyAuthToken(forged)).toBeNull();
		expect(verifyAuthToken("")).toBeNull();
		expect(verifyAuthToken("not-a-token")).toBeNull();
	});

	it("extracts bearer tokens from the Authorization header only", () => {
		expect(extractBearerToken(requestWithAuth("Bearer abc.def.ghi"))).toBe("abc.def.ghi");
		expect(extractBearerToken(requestWithAuth("Basic dXNlcjpwYXNz"))).toBeNull();
		expect(extractBearerToken(requestWithAuth("Bearer"))).toBeNull();
		expect(extractBearerToken(requestWithAuth())).toBeNull();
	});
});
