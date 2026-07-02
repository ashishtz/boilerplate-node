// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist/", "coverage/", "keys/", "node_modules/", "tests/.tmp/"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	// Prettier owns formatting; this disables every conflicting style rule.
	prettier,
	{
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			"no-console": "error",
			"no-nested-ternary": "error",
			"prefer-const": "error",
			eqeqeq: ["error", "smart"],
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
		},
	},
	{
		// Knex CLI files (knexfile, migrations, stubs) are plain CommonJS.
		files: ["**/*.js", "**/*.cjs"],
		languageOptions: {
			sourceType: "commonjs",
		},
		rules: {
			"@typescript-eslint/no-require-imports": "off",
		},
	},
);
