import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Intentional co-exports: shadcn/ui ships variant objects beside components,
    // context stores pair a Provider with its hook, and badge modules co-locate
    // tiny formatters with their badge components. These only affect dev-mode
    // fast-refresh granularity (never production builds), so the rule is scoped
    // off here and stays active everywhere else.
    files: [
      "src/components/ui/**/*.{ts,tsx}",
      "src/components/**/store.tsx",
      "src/components/**/status-badge.tsx",
      "src/components/**/badges.tsx",
      "src/hooks/use-theme.tsx",
      "src/hooks/use-direction.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  eslintPluginPrettier,
);
