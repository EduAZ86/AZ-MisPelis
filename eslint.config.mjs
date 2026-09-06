// @ts-check
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  { ignores: ["misPelis/**", "dist/*", "node_modules/*", ".expo/*"] },
  expoConfig,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/features/**", "!**/features/*/index"],
              message:
                "Solo app/ y features/ pueden importar features/ (dependencia: app → features → services → core).",
            },
          ],
        },
      ],
    },
  },
]);