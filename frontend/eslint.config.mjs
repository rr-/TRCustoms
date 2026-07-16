import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// Flat config replacing the old CRA "react-app" preset (dead under ESLint 9).
// Deliberately lenient: the goal is to catch real bugs (hook rules, obvious
// mistakes) without drowning the generated client and pragmatic casts in noise.
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".test-dist/**",
      "src/client/**",
      "*.config.js",
      "*.config.mjs",
      ".prettierrc.cjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      // TypeScript already resolves identifiers; no-undef only yields false
      // positives on TS/JSX globals.
      "no-undef": "off",
      // The classic pair the old react-app preset shipped. The newer
      // react-hooks plugin adds many compiler-oriented rules we do not opt in
      // to here.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": [
        "warn",
        { additionalHooks: "usePageMetadata" },
      ],
      // The generated client and a handful of pragmatic casts make explicit
      // `any` and empty interfaces unavoidable; keep them quiet.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      // The new JSX transform needs neither in scope.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
);
