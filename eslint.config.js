import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ["node_modules", "dist", ".next", "out"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
  // 🧩 TypeScript
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unused-vars": ["off"],
  "@typescript-eslint/ban-ts-comment": "off",

  // 🧠 React hooks (safe, but relaxed)
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "off",

  // 🧹 General
  "no-unused-vars": "off",
  "no-console": "off",
  "no-empty": "off"
}
