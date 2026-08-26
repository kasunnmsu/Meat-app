import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // These effects intentionally hydrate browser-only tablet state.
      "react-hooks/set-state-in-effect": "off",
      // Study images use CSS-controlled dimensions and local static assets.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "data/**",
    "next-env.d.ts",
    "tsconfig.tsbuildinfo",
  ]),
]);
