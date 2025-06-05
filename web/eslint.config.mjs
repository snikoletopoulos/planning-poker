import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import json from "eslint-plugin-json";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
// import tailwind from "eslint-plugin-tailwindcss";
import globals from "globals";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
});

export default tseslint.config(
	{ ignores: ["src/lib/db/migrations/*"] },
	{
		name: "Main options",
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: globals.node,
		},
		linterOptions: { reportUnusedDisableDirectives: false },
	},
	{ name: "ESlint recommended rules", ...eslint.configs.recommended },
	{
		name: "ESlint rules",
		files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
		rules: {
			/* Enforce camelCase */
			camelcase: "error",
			/* We allow console for debug and error reporting */
			"no-console": "off",
			/* Allow void for async functions */
			"no-void": ["error", { allowAsStatement: true }],
			/* Disabled this rule since it doesn't allow re-exporting default from index files */
			"no-restricted-exports": "off",
			/* Restrict function syntax */
			"func-style": ["error", "declaration", { allowArrowFunctions: true }],
			/* Restrict function syntax in objects */
			"object-shorthand": "error",
			/* Restrict callbacks to arrow functions */
			"prefer-arrow-callback": "warn",
			/* Make arrow functions omit braces if not needed */
			"arrow-body-style": ["warn", "as-needed"],
			/* Make sure there are no spaces before and after comments */
			"spaced-comment": ["error", "always", { markers: ["/", "!", "?"] }],
		},
	},
	{
		name: "Import",
		files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
		plugins: { import: importPlugin },
		rules: {
			...importPlugin.configs.recommended.rules,
			/* Duplicate from typescript */
			"import/named": "off",
			/* Duplicate from typescript */
			"import/namespace": "off",
			/* Duplicate from typescript */
			"import/default": "off",
			/* Duplicate from typescript */
			"import/no-named-as-default-member": "off",
			/* Duplicate from typescript */
			"import/no-unresolved": "off",
			/* Prevent cyclic imports */
			"import/no-cycle": "error",
			/* Allow default export of anonymous objects */
			"import/no-anonymous-default-export": [
				"error",
				{ allowObject: true, allowArray: true },
			],
			/* Allow default naming be the same as exported variables */
			"import/no-named-as-default": "off",
		},
	},
	{
		name: "JSON",
		files: ["**/*.{json,jsonc}"],
		plugins: { json },
		rules: json.configs["recommended"].rules,
	},
	{
		name: "Parser options for Typescript",
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				project: "tsconfig.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},

	tseslint.configs.recommendedTypeChecked,
	{
		name: "Typescript ESlint rules",
		files: ["**/*.{ts,tsx,mts,cts}"],
		rules: {
			/* Allow hoisting for functions for better code readability */
			"@typescript-eslint/no-use-before-define": "off",
			/* There are several cases that we need to use a promise as a callback */
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: {
						attributes: false,
					},
				},
			],
			/* This rule is too restrictive */
			"@typescript-eslint/return-await": "off",
			/* Disable unused-vars error when need to omit a field from object, { omittedField, ...params } = obj */
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					ignoreRestSiblings: true,
				},
			],
			/* Require only objects to convert to string */
			"@typescript-eslint/restrict-template-expressions": "error",
			/* Allow leading underscore for apollo gql __typename and lodash - already is allowed */
			"@typescript-eslint/naming-convention": [
				"error",
				{
					leadingUnderscore: "allow",
					selector: "default",
					format: null,
				},
			],
			/* Prevent checking wrong entry of an object */
			"@typescript-eslint/no-unnecessary-condition": "warn",
			/* Allow using namespaces */
			"@typescript-eslint/no-namespace": "off",
		},
	},
	{
		name: "Typescript ESlint rules (ignore .d.ts)",
		ignores: ["**/*.d.ts"],
		rules: {
			/* Restrict declaring types only as types (interfaces error) */
			"@typescript-eslint/consistent-type-definitions": ["error", "interface"],
		},
	},

	{
		name: "Import",
		files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
		plugins: { import: importPlugin },
		rules: importPlugin.configs.typescript.rules,
		settings: {
			...importPlugin.configs.typescript.settings,
			"import/resolver": {
				...importPlugin.configs.typescript.settings["import/resolver"],
				typescript: { project: "tsconfig.json" },
			},
		},
	},
	{
		name: "React",
		files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
		plugins: { react },
		rules: {
			...react.configs.recommended.rules,
			...react.configs["jsx-runtime"].rules,
			/* Disable PropTypes */
			"react/prop-types": "off",
			/* Explicitly set filename if it includes jsx */
			"react/jsx-filename-extension": ["warn", { extensions: [".jsx", "tsx"] }],
			/* Make all components arrow functions */
			"react/function-component-definition": [
				"warn",
				{
					namedComponents: "arrow-function",
					unnamedComponents: "arrow-function",
				},
			],
			/* Prevent unescaped template characters */
			"react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
			/* Nesting components are a bad practice */
			"react/no-unstable-nested-components": ["error", { allowAsProps: true }],
			/* Prevent indices as keys */
			"react/no-array-index-key": "error",
			/* Prevent inconstant useState naming */
			"react/hook-use-state": ["warn", { allowDestructuredState: true }],
			/* Make components with no children a self-closing tag */
			"react/self-closing-comp": "warn",
		},
		languageOptions: {
			parserOptions: {
				...react.configs.recommended.parserOptions,
				...react.configs["jsx-runtime"].parserOptions,
			},
			globals: {
				...globals.node,
				...globals.browser,
				...globals.es2021,
			},
		},
		settings: { react: { version: "detect" } },
	},
	{
		name: "React hooks",
		files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
		plugins: { "react-hooks": reactHooks },
		rules: reactHooks.configs.recommended.rules,
	},
	{ name: "React Compiler", ...reactCompiler.configs.recommended },
	{
		files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
		plugins: { "jsx-a11y": jsxA11yPlugin },
		rules: {
			"jsx-a11y/lang": "warn",
		},
	},
	// {
	// 	name: "Tailwind",
	// 	settings: {
	// 		tailwindcss: {
	// 			callees: ["classnames", "clsx", "ctl", "cn"],
	// 		},
	// 	},
	// },
	// tailwind.configs["flat/recommended"],
	...compat.extends("next/core-web-vitals"),
	{ name: "Prettier", ...prettier },
);
