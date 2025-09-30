const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "next-env.d.ts",
      "jest.config.js",
      "tailwind.config.ts",
      "postcss.config.mjs",
      "next.config.mjs",
      "coverage/**",
    ],
  },
  {
    rules: {
      // Turn off noisy warnings that would require extensive refactoring
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      
      // Keep these as warnings but allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      
      // Turn off less critical warnings
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react-hooks/exhaustive-deps": "off",
      
      // Keep import/export warnings
      "import/no-anonymous-default-export": "warn",
    },
  },
];

module.exports = eslintConfig;