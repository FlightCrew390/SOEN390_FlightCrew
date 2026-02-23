// https://docs.expo.dev/guides/using-eslint/
import expoConfig from "eslint-config-expo/flat.js";
import esLintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  ...expoConfig,
  esLintPluginPrettierRecommended,
  {
    ignores: ["dist/*", "node_modules/*"],
  },
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    files: ["app.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    ...testingLibrary.configs["flat/react"],
  },
]);
