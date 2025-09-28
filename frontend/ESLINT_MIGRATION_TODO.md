# ESLint Migration TODO

## Issue
Next.js lint command shows deprecation warning:
```
`next lint` is deprecated and will be removed in Next.js 16.
For new projects, use create-next-app to choose your preferred linter.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .
```

## Current Status
- Using `next lint` which still works but shows deprecation warning
- ESLint v9.36.0 has breaking changes with config format
- Direct ESLint CLI fails due to config format incompatibility

## Migration Steps Needed
1. Run the official codemod: `npx @next/codemod@canary next-lint-to-eslint-cli .`
2. Update ESLint configuration to flat config format (eslint.config.js)
3. Test and update package.json scripts
4. Remove this file after migration

## Priority
Low - Current setup works fine, migrate when Next.js 16 is released or when time permits.