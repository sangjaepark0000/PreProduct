import path from "node:path";
import { fileURLToPath } from "node:url";

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "_bmad-output/test-artifacts/**",
      "tests/e2e/**",
      "tests/support/**",
      "tests/fixtures/**"
    ]
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-imports": [
        "error",
        {
          patterns: ["../*", "../../*", "../../../*", "../../../../*"]
        }
      ]
    }
  },
  {
    files: ["**/*.mjs"],
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }]
    }
  },
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "no-console": "off"
    }
  }
];

export default eslintConfig;
