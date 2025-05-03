import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused vars
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Disable react/no-unescaped-entities
      "react/no-unescaped-entities": "off",

      // Allow use of `any`
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
