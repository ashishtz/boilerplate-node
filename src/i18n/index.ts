import { DEFAULT_LANGUAGE, Language, messages } from "./messages";

const catalog: Record<Language, Record<string, string>> = messages;

/**
 * Translates a message code into a human readable message. Unknown codes
 * fall back to English first, then to the code itself so that new codes
 * never break responses.
 */
export const transform = (code: string, lang: Language = DEFAULT_LANGUAGE): string => {
	return catalog[lang]?.[code] ?? catalog[DEFAULT_LANGUAGE][code] ?? code;
};

export { DEFAULT_LANGUAGE, messages } from "./messages";
export type { Language } from "./messages";
