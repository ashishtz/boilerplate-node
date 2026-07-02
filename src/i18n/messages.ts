/**
 * Message catalog keyed by language. Add a new language by adding a key
 * here; any code missing from a language falls back to English and then
 * to the raw code itself.
 */
export const messages = {
	en: {
		SUCCESS: "Success.",
		GENERAL_ERROR: "Oops! Something went wrong. Please try again.",
		BAD_REQUEST: "The request could not be processed.",
		INVALID_JSON: "The request body contains malformed JSON.",
		VALIDATION_FAILED: "The request contains invalid data.",
		NOT_FOUND: "The requested resource was not found.",
		NOT_AVAILABLE: "This service is not available.",
		TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
		NOT_AUTHENTICATED: "You are not authenticated to access this service.",
		NOT_AUTHORIZED: "You are not authorized to access this service.",
		INVALID_CREDENTIALS: "Invalid credentials provided. Please try again.",
		ACCOUNT_INACTIVE: "Your account is inactive. Please contact an administrator.",
		USER_NOT_FOUND: "User not found.",
		USER_ADDED: "User added successfully.",
		EMAIL_ALREADY_EXISTS: "A user with this email address already exists.",
	},
} as const;

export type Language = keyof typeof messages;

export const DEFAULT_LANGUAGE: Language = "en";
