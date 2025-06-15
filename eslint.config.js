// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
// To integrate Prettier with ESLint
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  // To integrate Prettier with ESLint
  eslintPluginPrettierRecommended,
  {
    ignores: ["dist/*"],
  },
]);
