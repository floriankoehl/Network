import js from "@eslint/js";
import react from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    plugins: {
      react,
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off"
    },
    languageOptions: {
      globals: {
        ...js.configs.recommended.languageOptions.globals,
        window: "readonly",
        document: "readonly",
      },
    },
  }
];
