// https://docs.expo.dev/guides/using-eslint/
import expoConfig from "eslint-config-expo/flat.js";
import esLintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig([
  expoConfig,
  esLintPluginPrettierRecommended,
  {
    ignores: ["dist/*", "node_modules/*"],
  },
]);
