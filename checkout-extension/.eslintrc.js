/* global module */
module.exports = {
  plugins: ["react", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "17.0",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
  },
  ignorePatterns: ["build/*"],
};
