import { describe, expect, it } from "vitest";
import { messages, transform } from "../../src/i18n";

describe("i18n transform", () => {
	it("translates a known code", () => {
		expect(transform("USER_NOT_FOUND")).toBe(messages.en.USER_NOT_FOUND);
	});

	it("falls back to the raw code for unknown messages", () => {
		expect(transform("SOME_UNKNOWN_CODE")).toBe("SOME_UNKNOWN_CODE");
	});
});
