import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";

// These tests exercise the full middleware chain in-process. None of the
// covered routes touch the database, so they run without infrastructure.
describe("app", () => {
	let app: ReturnType<typeof createApp>;

	beforeAll(() => {
		app = createApp();
	});

	it("serves the liveness probe with the standard envelope", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body.status).toBe(200);
		expect(response.body.data.status).toBe("ok");
		expect(response.headers["x-powered-by"]).toBeUndefined();
	});

	it("answers unknown routes with the 404 envelope", async () => {
		const response = await request(app).get("/definitely-not-a-route");

		expect(response.status).toBe(404);
		expect(response.body).toMatchObject({ status: 404 });
		expect(response.body.message).toBeTruthy();
	});

	it("rejects invalid login payloads with a 422 validation envelope", async () => {
		const response = await request(app).post("/api/auth/login").send({ email: "not-an-email" });

		expect(response.status).toBe(422);
		expect(response.body.status).toBe(422);
		expect(Array.isArray(response.body.data)).toBe(true);

		const keys = response.body.data.flatMap((entry: Record<string, string>) => Object.keys(entry));
		expect(keys).toContain("email");
		expect(keys).toContain("password");
	});

	it("answers malformed JSON bodies with a 400 envelope", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.set("Content-Type", "application/json")
			.send("{ this is not json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe(400);
	});
});
