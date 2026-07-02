import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/tokens";

describe("password hashing", () => {
	it("hashes and verifies a password round-trip", async () => {
		const hash = await hashPassword("s3cret-password");

		expect(hash).not.toContain("s3cret-password");
		await expect(verifyPassword("s3cret-password", hash)).resolves.toBe(true);
		await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
	});

	it("returns false instead of throwing on malformed hashes", async () => {
		await expect(verifyPassword("whatever", "not-a-bcrypt-hash")).resolves.toBe(false);
	});
});
