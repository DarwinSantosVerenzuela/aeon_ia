import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Utility scripts (CommonJS, not production code)
    "scripts/**",
  ]),
  {
    rules: {
      // Disable: standard React pattern for localStorage/sessionStorage hydration in useEffect
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
