/** Shared ESLint preset for all apps/packages in the handwerker-platform monorepo. */
module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: ["dist/**", ".next/**", ".expo/**", "node_modules/**"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
