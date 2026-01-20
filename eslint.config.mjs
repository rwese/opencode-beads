import tseslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
	{
		files: ["**/*.ts"],
		ignores: ["dist/**", "node_modules/**"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: typescriptParser,
		},
		plugins: {
			"@typescript-eslint": tseslint,
			prettier: prettier,
		},
		rules: {
			// Prettier formatting
			"prettier/prettier": "error",

			// TypeScript-ESLint rules
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-empty-interface": "warn",
			"@typescript-eslint/no-non-null-assertion": "off",

			// Best practices
			"no-console": "warn",
			"no-debugger": "error",
			"no-alert": "error",
			"no-eval": "error",
			"no-implicit-globals": "off",

			// Code quality
			"prefer-const": "error",
			"no-var": "error",
			"no-let": "off",

			// Style
			semi: ["error", "always"],
			quotes: ["error", "single", { avoidEscape: true }],
			indent: ["error", 2],
			"linebreak-style": ["error", "unix"],
			"max-len": ["warn", { code: 100, comments: 120 }],
		},
	},
];
